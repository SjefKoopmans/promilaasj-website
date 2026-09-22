# backlog-20260922-artwin-tour-sync — Auto-update tour dates from Artwin

**Status:** built (on branch `artwin-tour-sync`, not yet merged) · **Requested:** 2026-09-22 · **Researched:** 2026-09-22 · **Built:** 2026-09-22

**Outcome:** Sjef created the widget (type JSON, "Public confirmed bookings") and added its URL as the `ARTWIN_ICAL_URL` GitHub Actions secret. `scripts/sync-gigs.mjs` fetches it and rebuilds `assets/js/gigs.js`, keeping only `date`, `title`, `venue`, `city`, `url` — venue/booking phone numbers, addresses and coordinates that Artwin includes are never read into the output. `.github/workflows/sync-gigs.yml` runs it daily (and on manual trigger), runs `npm test` against the result, and commits `gigs.js` only if it changed.

Tested locally against the real feed: 16 bookings came back, all mapped cleanly (0 skipped). Two real issues found and fixed along the way:
- Artwin HTML-encodes some names (e.g. `&quot;`) — the script now decodes common entities so they don't show up literally on the site.
- A few bookings have no `event.title` in Artwin; the script falls back to the venue name, which Artwin stores in ALL CAPS (e.g. "ZAAL 4 EVENTS", "DON BOSCO") — displays as-is, no automatic re-casing, see open question 4.

Side effect: this also fixes the pre-existing failing test (several hand-entered rows in the old `gigs.js` had a blank title) — Artwin's data has none, so `npm test` is fully green for the first time. It also corrected a date: the old manual entry for "Herenzitting" at Stroatje said 2026-11-09; Artwin's own record says 2026-11-08.

**What:** Instead of Sjef hand-editing `assets/js/gigs.js`, pull the tour dates automatically from Artwin so the calendar updates itself.

## Research findings (2026-09-22)

"Artwin" turns out to be two related but separate products from the same company:
- **Artwin Live** (`artwinlive.com`) — the artist/agency planning tool with a **public artist profile page and a WordPress integration for showing gigs on a website**. This is almost certainly what's meant here.
- **Artwin Software / ARTWINPRO** (`artwin.nl`, `artwinsoftware.com`) — back-office booking software for booking agencies (contracts, invoicing). Nr.1 Artiesten (Promilaasj's agency) may use this internally; it's not artist/website-facing, so it's out of scope for our site.

**The good news: no credential is needed for read-only tour dates.** Artwin Live offers two ways to get gigs onto a website, and both are plain public identifiers, not secrets:
1. **iCalendar feed** — a public URL like `https://artwinlive.com/widgets/[code]?[options]`. No API key, no login required to read it; anyone with the URL can fetch it (same idea as a Google Calendar "secret" iCal link — the [code] is where it's not-guessable, not something the docs say to actively protect). Fields include event dates/times, titles, venue/schedule, and confirmation status.
2. **WordPress shortcode `[artwinlive_tour_dates]`** with a `widget_id` parameter — also a plain public ID meant to sit directly in page/shortcode source. Created from the artist's Artwin Live account under "Mijn Widgets" → "Widget toevoegen" → export type "WordPress-widget".

Separately, there's a **brand-new (v1.0.0, released 2026-09-21) official WordPress plugin** ("Artwin Live" on wordpress.org) that instead connects via **OAuth-style access tokens**, stored server-side by WordPress, to also *submit* booking requests from the site back to Artwin. That token *is* a real credential and is kept server-side by design (WordPress's PHP backend holds it, never the page HTML) — but it's solving a different problem (two-way booking requests), not our read-only "show upcoming gigs" need. We don't need this plugin or its token at all.

**Conclusion:** for just displaying tour dates, the iCalendar feed (or the widget's public ID) is exactly the "public feed" scenario the ticket hoped for — there's no secret to protect, so the original credential-handling concern mostly dissolves. A scheduled GitHub Action is still worth doing (to convert the feed into `gigs.js`'s format and keep the site static/fast), but it's for convenience and resilience, not for hiding a secret.

## Recommended approach
1. Sjef gets the **iCalendar-URL** for Promilaasj's calendar from Artwin Live (`Mijn Widgets` → the relevant widget, or ask Nr.1 Artiesten if the calendar lives under the agency's account).
2. Add a small **GitHub Action** (e.g. daily, or every few hours) that:
   - Fetches that iCal URL (plain HTTP GET, no auth).
   - Parses it and writes `assets/js/gigs.js` in its existing `window.GIGS = [...]` shape.
   - Commits and pushes the updated file only if it changed.
3. Keep `npm test`'s existing gigs.js validation (check 4 in `tests/smoke.mjs`) as a safety net — a malformed sync fails the test/Action rather than silently breaking the live site.
4. Since the URL isn't sensitive, it can live directly in the Action's workflow file (committed, visible) — no GitHub secret needed. (If Sjef would rather not have the raw URL sit in a public file for any reason, it can still go in a repo secret at no extra cost — just not required for security.)

## Acceptance criteria
- `gigs.js` updates automatically from Artwin on a schedule, without Sjef hand-editing it.
- `gigs.js` keeps its current shape so the rest of the site (sorting, empty state, tests) needs no changes.
- A sync failure (Artwin down, bad/empty feed) doesn't overwrite `gigs.js` with something worse — keep the last good file and fail the Action run loudly instead.
- `npm test` still passes after a sync.

## Open questions for Sjef
1. ~~Does Promilaasj already have an Artwin Live calendar?~~ Resolved — Sjef created the widget himself.
2. Is once a day frequent enough, or do new gigs need to show up sooner? (Easy to change: one line in the workflow's cron schedule, or just click "Run workflow" manually any time.)
3. ~~Do the fields map cleanly?~~ Mostly — see the venue-as-title fallback below.
4. Some bookings have no title in Artwin, so the site shows the venue name (in Artwin's stored ALL-CAPS form) instead, e.g. "ZAAL 4 EVENTS" as both the heading and the venue line. Fine to leave as-is, or should we title-case these automatically? (Risk: an automatic re-casing rule could mangle acronyms or Limburgish spellings — the more reliable fix is adding a proper event title in Artwin for those bookings.)
5. Not yet verified: whether GitHub's `ubuntu-latest` runner has Google Chrome available for the `npm test` step in the workflow (it's normally preinstalled, but this hasn't been confirmed by an actual run yet — worth checking the first time the workflow fires, either the daily schedule or a manual "Run workflow" click).

## Sources
- [WordPress plugin — Artwin Live knowledgebase](https://support.artwinlive.com/knowledgebase/35/WordPress-plugin.html?language=dutch)
- [iCalendar Widget — Artwin Live knowledgebase](https://support.artwinlive.com/index.php/knowledgebase/12/iCalendar-Widget.html?language=dutch)
- [Artwin Live – WordPress plugin | WordPress.org](https://wordpress.org/plugins/artwin-live/)
- [Artwin Live voor moderne artiestenorganisaties](https://artwinlive.com/nl)
- [Artwin Software - Software voor boekingskantoren](https://artwin.nl/downloads/)
- [Provisual Gigs — website & boekingssysteem voor bands](https://provisualonline.nl/provisual-gigs-website-boekingssysteem-bands/)
