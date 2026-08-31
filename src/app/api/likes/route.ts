import { createHash } from "node:crypto";

import { LIKES_ENABLED } from "@/lib/flags";
import { getRedis } from "@/lib/redis";

/**
 * The site-wide like count.
 *
 * One counter for the whole map, not one per topic. That was the decision, and
 * it is what makes this route trivial: there is no slug parameter, so there is
 * no allowlist of valid keys to check, so this never imports the content
 * loader — and therefore never drags `docs/` and a 573-file cold-start walk
 * into its bundle.
 *
 * **Every failure answers 200 with a well-formed body.** Flag off, no store,
 * network blip: the client gets `{ ok: false, count: null }` and renders
 * nothing. A reader should never see an error where a number was going to be,
 * and a counter is not worth a red line in anyone's console.
 *
 * **The count never reaches a page through the server.** No page awaits this
 * and none revalidates for it; the browser fetches it after paint. Reading it
 * server-side would convert 573 static pages into ISR pages that re-render on a
 * timer — each one re-walking `docs/` and re-rendering markdown — and would put
 * Redis on the critical path of the HTML, so a store outage would become a site
 * outage. Client-side after paint is the only shape that keeps the prerender.
 * Please do not "optimise" this into the page.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COUNT_KEY = "likes:site";

/** `{ ok: false }`, for every reason a count might not exist. */
const unavailable = () =>
  Response.json({ ok: false, count: null }, { status: 200 });

/**
 * A stable, irreversible id for one visitor for one day.
 *
 * The raw IP is never stored. The salt is what matters: an unsalted SHA-256 of
 * an IPv4 address is reversible by anyone willing to hash four billion inputs,
 * which is minutes of work.
 */
function visitorKey(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const salt = process.env.LIKES_IP_SALT ?? "";
  return createHash("sha256").update(`${ip}${salt}`).digest("hex").slice(0, 32);
}

export async function GET() {
  const redis = getRedis();
  if (!LIKES_ENABLED || !redis) return unavailable();

  try {
    const count = await redis.get<number>(COUNT_KEY);
    return Response.json(
      { ok: true, count: count ?? 0 },
      {
        headers: {
          // Shared for a minute so a front-page spike does not spend a command
          // per reader, but `max-age=0` so the reader's own browser always
          // re-asks — they have just clicked and expect their own click to be
          // in the number.
          "cache-control":
            "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  const redis = getRedis();
  if (!LIKES_ENABLED || !redis) return unavailable();

  try {
    // NX + EX is the entire rate limit: the first caller from this address
    // today gets the key and the increment, everyone else gets `null` and the
    // current total. One round trip, atomic, self-expiring — no rate-limit
    // library and no cleanup job.
    //
    // It is not auth-grade, and does not need to be. Someone determined with a
    // VPN can inflate a vanity counter; the ceiling worth building to is
    // "an honest double-click does not count twice".
    const first = await redis.set(`likes:ip:${visitorKey(request)}`, 1, {
      nx: true,
      ex: 86_400,
    });

    const count = first
      ? await redis.incr(COUNT_KEY)
      : ((await redis.get<number>(COUNT_KEY)) ?? 0);

    return Response.json({ ok: true, count, counted: Boolean(first) });
  } catch {
    return unavailable();
  }
}
