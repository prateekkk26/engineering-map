#!/usr/bin/env python3
"""Resource link checker for docs/. Read-only, network-bound.

`check-docs.py` proves the frontmatter is well-formed; this proves the links in
it still resolve. PRD Phase 4 asks for "verified resources", and a curated link
that 404s is worse than no link at all — it is discovered on a train, mid-read.

Usage:  python3 scripts/check-links.py docs [--all]

Exit code 1 if any URL is dead. Reports which topic owns it, and whether it was
that topic's `primary` — the one link the page promises is worth reading first.

A 403/406/429 is not rot. W3C, Cloudflare, LeetCode, ACM, O'Reilly, Medium and
Uber all refuse a scripted request and serve the page fine in a browser. Those
are reported separately and do not fail the run; --all prints them in full.
"""
import collections, concurrent.futures, pathlib, re, ssl, sys, time, urllib.request

try:
    import yaml
except ImportError:
    sys.exit("needs pyyaml: pip install pyyaml")

DOCS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "docs")
SHOW_ALL = "--all" in sys.argv

# Bot-detection, not rot. The page is fine; the request is what got refused.
BLOCKED = {401, 403, 406, 429}
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
    "Accept": "*/*",
}
# A stock python.org install on macOS ships no root certificates, so a verifying
# context fails every HTTPS request with URLError and reports the whole corpus as
# dead. Use certifi's roots when they're installed; otherwise skip verification —
# this checker only asks whether a URL still resolves, and sends nothing.
try:
    import certifi

    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()
    CTX.check_hostname = False
    CTX.verify_mode = ssl.CERT_NONE

# url -> [(topic slug, is_primary)]
owners = collections.defaultdict(list)
for p in sorted(DOCS.rglob("*.md")):
    if "_meta" in p.parts:
        continue
    m = re.match(r"^---\n(.*?)\n---", p.read_text(), re.S)
    if not m:
        continue
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        continue  # check-docs.py owns that failure
    slug = str(p.relative_to(DOCS)).removesuffix(".md")
    for r in fm.get("resources") or []:
        if r.get("url"):
            owners[r["url"]].append((slug, bool(r.get("primary"))))


def check(url):
    """HEAD first, GET on failure — some hosts only answer one of them.

    A connection-level failure is retried once after a pause: a thousand
    requests in a burst will exhaust the local resolver long before any of
    these hosts are actually down, and a false "dead" here costs a real link.
    """
    last = "ERR"
    for attempt in range(2):
        for method in ("HEAD", "GET"):
            try:
                req = urllib.request.Request(url, method=method, headers=UA)
                return url, urllib.request.urlopen(req, timeout=20, context=CTX).status
            except Exception as e:
                code = getattr(e, "code", None)
                if method == "HEAD":
                    continue
                if code:
                    return url, code  # a real HTTP answer, not a network blip
                # Keep the message, not just the class — "certificate verify
                # failed" and "nodename nor servname provided" are the same
                # URLError and want completely different fixes.
                last = f"{type(e).__name__}: {getattr(e, 'reason', e)}"
        time.sleep(2 + attempt * 3)
    return url, last


results = {}
with concurrent.futures.ThreadPoolExecutor(12) as ex:
    for url, status in ex.map(check, owners):
        results[url] = status

dead = {u: s for u, s in results.items() if s not in (200, 301, 302, 307, 308) and s not in BLOCKED}
blocked = {u: s for u, s in results.items() if s in BLOCKED}

if dead:
    print(f"DEAD ({len(dead)}):\n")
    # Primaries first — those are the ones that break a page's promise.
    for url, status in sorted(dead.items(), key=lambda kv: (not any(p for _, p in owners[kv[0]]), kv[0])):
        flag = "PRIMARY " if any(p for _, p in owners[url]) else "        "
        print(f"{flag}{status}\t{url}")
        for slug, _ in owners[url]:
            print(f"          {slug}")
    print()

if blocked:
    print(f"Refused a scripted request ({len(blocked)}) — verify by hand, usually fine.")
    if SHOW_ALL:
        for url, status in sorted(blocked.items()):
            print(f"  {status}\t{url}")
    print()

print(f"{len(owners)} unique URLs across {sum(len(v) for v in owners.values())} references. "
      f"{len(dead)} dead.")
sys.exit(1 if dead else 0)
