# backlog-20260922-artwin-tour-sync — Auto-update tour dates from Artwin

**Status:** open, ready to scope with Sjef's Artwin details · **Requested:** 2026-09-22 · **Researched:** 2026-09-22

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
1. Does Promilaasj (or Nr.1 Artiesten on their behalf) already have an Artwin Live account/calendar for this band? If it's the agency's account, someone there needs to generate the iCalendar-URL or widget ID and share it — it's not sensitive, but Sjef likely doesn't have login access himself.
2. Is daily/every-few-hours sync frequent enough, or do new gigs need to show up within minutes?
3. Do the fields Artwin exposes (title, venue/schedule, date/time, confirmed vs. tentative) map cleanly onto `gigs.js`'s `{date, title, venue, city, url}` shape, or is some manual cleanup still needed (e.g. Artwin may not have a ticket-sales URL per gig)?

## Sources
- [WordPress plugin — Artwin Live knowledgebase](https://support.artwinlive.com/knowledgebase/35/WordPress-plugin.html?language=dutch)
- [iCalendar Widget — Artwin Live knowledgebase](https://support.artwinlive.com/index.php/knowledgebase/12/iCalendar-Widget.html?language=dutch)
- [Artwin Live – WordPress plugin | WordPress.org](https://wordpress.org/plugins/artwin-live/)
- [Artwin Live voor moderne artiestenorganisaties](https://artwinlive.com/nl)
- [Artwin Software - Software voor boekingskantoren](https://artwin.nl/downloads/)
- [Provisual Gigs — website & boekingssysteem voor bands](https://provisualonline.nl/provisual-gigs-website-boekingssysteem-bands/)
