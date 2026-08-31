/**
 * Build-time feature switches — PRD §10.
 *
 * Three rules, all forced by how Next inlines environment variables:
 *
 * 1. **`process.env.NEXT_PUBLIC_X` is written out in full, every time.** Next
 *    substitutes the literal text of the member expression at build. A
 *    destructure (`const { NEXT_PUBLIC_X } = process.env`) or a computed key
 *    (`process.env[name]`) is not substituted and reads `undefined` in the
 *    browser. There is no way to loop over these.
 * 2. **Each flag is a top-level `const` compared directly to a string**, so it
 *    folds to `true`/`false` before minification and `FLAG ? … : null` is
 *    dropped rather than evaluated. A helper like `on(process.env.X)` is a
 *    function call, which does not fold.
 * 3. **Opt-in, never opt-out.** An unset variable is off. A misspelled variable
 *    is off. Nothing new appears on the public site because a deploy forgot a
 *    value — the failure direction is "feature missing", never "feature
 *    leaked".
 *
 * These are baked per build. Changing one in the Vercel dashboard needs a
 * redeploy; there is no runtime toggle, deliberately.
 *
 * Server-only secrets are not here. They are read inside the route handler
 * that needs them, so no unprefixed variable can be reached from a component.
 */

/** Reader progress: the covered bit, the rollup meters, `/progress`. */
export const PROGRESS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_PROGRESS === "1";

/** Google Analytics. Paired with `GA_ID` below — see `ANALYTICS_ENABLED`. */
const ANALYTICS_FLAG = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "1";

/** The site-wide like count. Also needs a reachable Redis store. */
export const LIKES_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LIKES === "1";

/** Display of the visitor count. The route can be live while this is off. */
export const VISITORS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_VISITORS === "1";

/** The support link. Paired with the checkout URL — see `DONATIONS_ENABLED`. */
const DONATIONS_FLAG = process.env.NEXT_PUBLIC_ENABLE_DONATIONS === "1";

/** GA4 measurement ID, `G-XXXXXXXXXX`. Public by design — it is in the page. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

/** A Polar hosted Checkout Link. Public by design — it is the `href`. */
export const POLAR_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL ?? "";

/** Absolute origin, no trailing slash. Feeds `metadataBase` and the sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://engineering-map.vercel.app";

/**
 * A flag plus the configuration it cannot work without.
 *
 * The pair matters. An analytics flag with no measurement ID would render a
 * script tag pointing at `G-undefined`, and a donations flag with no checkout
 * URL would render a button that goes nowhere. Both are worse than the feature
 * being off, so the flag alone is never the condition.
 */
export const ANALYTICS_ENABLED = ANALYTICS_FLAG && GA_ID.length > 0;
export const DONATIONS_ENABLED =
  DONATIONS_FLAG && POLAR_CHECKOUT_URL.length > 0;
