#!/usr/bin/env python3
"""Structural check for docs/ topic files. Read-only."""
import re, sys, pathlib, collections

try:
    import yaml
except ImportError:
    sys.exit("needs pyyaml: pip install pyyaml")

DOCS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
HEADINGS = ["## In one line", "## What it is", "## Why it matters", "## Key points"]
problems = collections.defaultdict(list)

topic_files = [p for p in DOCS.rglob("*.md") if "_meta" not in p.parts]
slugs = {str(p.relative_to(DOCS)).removesuffix(".md") for p in topic_files}

# Slugs that are specified in a _meta.yaml but not authored yet. In a depth-first
# build these are planned work, not broken links.
planned = set()
for meta in DOCS.rglob("_meta.yaml"):
    data = yaml.safe_load(meta.read_text()) or {}
    d = meta.parent.relative_to(DOCS)
    for t in data.get("topics") or []:
        planned.add(f"{d}/{t}")
pending_count = len(planned - slugs)

for p in sorted(topic_files):
    rel = str(p.relative_to(DOCS))
    text = p.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        problems[rel].append("no frontmatter")
        continue
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        problems[rel].append(f"invalid YAML: {e}")
        continue
    body = m.group(2)

    for field in ("title", "summary", "level", "minutes", "resources"):
        if not fm.get(field):
            problems[rel].append(f"missing frontmatter: {field}")

    if fm.get("level") not in ("core", "deep"):
        problems[rel].append(f"level must be core|deep, got {fm.get('level')!r}")

    s = (fm.get("summary") or "").strip()
    if s.rstrip(".").count(". ") > 0:
        problems[rel].append("summary looks like more than one sentence")

    res = fm.get("resources") or []
    primaries = [r for r in res if r.get("primary")]
    if len(primaries) != 1:
        problems[rel].append(f"expected exactly 1 primary resource, found {len(primaries)}")
    if not 3 <= len(res) <= 5:
        problems[rel].append(f"expected 3-5 resources, found {len(res)}")
    for r in res:
        for f in ("title", "url", "source", "type"):
            if not r.get(f):
                problems[rel].append(f"resource missing {f}: {r.get('title') or r.get('url')}")
        if r.get("type") not in ("docs", "article", "video", "repo", "book", "course"):
            problems[rel].append(f"bad resource type {r.get('type')!r}")

    for slug in fm.get("related") or []:
        if slug not in slugs and slug not in planned:
            problems[rel].append(f"dangling related: {slug} (not authored, not planned)")

    if rel.startswith("_shared/") and not fm.get("surfaced_in"):
        problems[rel].append("_shared topic missing surfaced_in")

    found = [h for h in HEADINGS if re.search(rf"^{re.escape(h)}\s*$", body, re.M)]
    if found != HEADINGS:
        problems[rel].append(f"headings wrong/out of order: {found}")

    prose = re.sub(r"^---.*?^---", "", body, flags=re.S | re.M)
    words = len(re.findall(r"\b[\w'-]+\b", prose))
    if not 300 <= words <= 900:
        problems[rel].append(f"body {words} words (target 300-600, hard max 900)")

# _meta.yaml topics list <-> files
for meta in DOCS.rglob("_meta.yaml"):
    d = meta.parent
    rel = str(meta.relative_to(DOCS))
    data = yaml.safe_load(meta.read_text()) or {}
    listed = data.get("topics")
    if listed is None:
        continue
    on_disk = {p.stem for p in d.glob("*.md")}
    # A listed topic with no file is planned work, not an error. A file not listed
    # in topics IS an error — it means the meta drifted from reality.
    for t in sorted(on_disk - set(listed)):
        problems[rel].append(f"file not listed in topics: {t}.md")

# duplicate resource URLs
urls = collections.defaultdict(list)
for p in topic_files:
    m = re.match(r"^---\n(.*?)\n---", p.read_text(), re.S)
    if not m:
        continue
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        continue
    for r in fm.get("resources") or []:
        if r.get("url"):
            urls[r["url"]].append(str(p.relative_to(DOCS)))

dupes = {u: fs for u, fs in urls.items() if len(fs) > 1}

if problems:
    for f in sorted(problems):
        print(f"\n{f}")
        for msg in problems[f]:
            print(f"  - {msg}")
else:
    print("No structural problems.")

if dupes:
    print("\nDuplicate resource URLs (review, not necessarily wrong):")
    for u, fs in dupes.items():
        print(f"  {u}\n    {', '.join(fs)}")

print(f"\n{len(topic_files)} topic files checked, {pending_count} planned but not yet authored.")
sys.exit(1 if problems else 0)
