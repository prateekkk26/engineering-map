import "server-only";

import { Redis } from "@upstash/redis";

/**
 * The counter store, or nothing.
 *
 * Returns `null` rather than throwing when it is unconfigured, because "no
 * store" is a supported state and not an error: the likes flag can be on in a
 * preview deployment that has no database attached, and a page that renders
 * without a count is strictly better than one that 500s.
 *
 * **Both credential spellings are accepted.** The Vercel ↔ Upstash Marketplace
 * integration has injected `KV_REST_API_*` — the names Vercel KV used before it
 * was retired in favour of the marketplace — and `UPSTASH_REDIS_REST_*` at
 * different times, and which pair a project gets depends on when the
 * integration was installed. Checking both is two lines; debugging a counter
 * that is silently always zero is an afternoon.
 *
 * `server-only` at the top makes an accidental import from a client component
 * a build error rather than a leaked token.
 *
 * HTTP-based rather than a TCP client, which is what makes this safe on
 * serverless at all: there is no connection to pool and nothing to exhaust when
 * a hundred functions start at once.
 */
let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
