import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { VISITORS_ENABLED } from "@/lib/flags";

/**
 * The visitor count, read from Google Analytics.
 *
 * The number on the page is the number in the dashboard, which is the whole
 * reason this talks to GA rather than keeping a counter of its own. The cost is
 * a service account, and two honest caveats worth knowing before quoting the
 * figure anywhere: **GA data lags** — hours, and some dimensions a day or two —
 * and **it counts what `gtag` reported**, so every reader with an ad blocker is
 * invisible. A self-hosted counter would be larger and sooner; it would also
 * disagree with the dashboard forever.
 *
 * `revalidate` rather than a live call per request: this is a footer line, the
 * number moves slowly, and the GA Data API has its own quota that a traffic
 * spike would otherwise burn through in minutes.
 *
 * Node runtime, not edge — the Google client signs its JWT with `node:crypto`.
 *
 * Setup, all outside this repo: create a Google Cloud project, enable the
 * Google Analytics Data API, create a service account and download its JSON
 * key, then add that service account's email as a Viewer under GA4 Admin →
 * Property Access Management. The three values below come from the key file.
 */
export const runtime = "nodejs";
export const revalidate = 3600;

/** `{ visitors: null }` — the component renders nothing rather than a zero. */
const unavailable = () => Response.json({ visitors: null }, { status: 200 });

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID;
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  const privateKey = process.env.GA_SA_PRIVATE_KEY;

  if (!VISITORS_ENABLED || !propertyId || !clientEmail || !privateKey) {
    return unavailable();
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        // The standard failure with this integration: a PEM key pasted into an
        // environment variable arrives with literal backslash-n rather than
        // newlines, and the JWT signer rejects it with an error that says
        // nothing about why.
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    });

    const [report] = await client.runReport({
      property: `properties/${propertyId}`,
      // A start date before the property existed, so this is "all time"
      // without having to know when tracking began.
      dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
      metrics: [{ name: "totalUsers" }],
    });

    const raw = report.rows?.[0]?.metricValues?.[0]?.value;
    const visitors = raw ? Number.parseInt(raw, 10) : Number.NaN;

    return Number.isFinite(visitors)
      ? Response.json({ visitors })
      : unavailable();
  } catch {
    // Deliberately silent. A misconfigured service account should cost a line
    // in the footer, never a visible error on a reading page.
    return unavailable();
  }
}
