# backlog-20260922-artwin-tour-sync — Auto-update tour dates from Artwin

**Status:** open (research needed) · **Requested:** 2026-09-22

**What:** Instead of Sjef hand-editing `assets/js/gigs.js`, pull the tour dates automatically from Artwin (the booking-agency system; there's a WordPress plugin for it) so the calendar updates itself.

**The catch:** the site's repo is public and static (no server, no WordPress). Any API key or login placed in client-side JavaScript is visible to anyone who opens the browser's dev tools, regardless of whether the git repo is public or private — so an Artwin credential must never be written into `assets/js/*.js` or any file that ships to the browser.

**Not yet known (needs checking with the booking agency / Artwin, not guessed here):**
1. Does Artwin offer a plain data feed for an artist's shows (iCal, RSS, JSON) that needs no secret to read — the way Bandsintown/Songkick do? If so, this is simple: fetch it and no credential question exists at all.
2. If it only offers an authenticated API (the kind the WordPress plugin uses via a key entered in WP admin), what auth does it use (API key, OAuth), and does it support read-only, artist-scoped keys?
3. Does Artwin's plugin/API have any rate limit or usage terms that matter for a small hourly/daily sync?

**How to do this without exposing a credential (the general answer, once the above is known):**
- **If there's a public feed:** fetch it directly, either client-side (a small `fetch()` in `main.js`) or, better, on a schedule (see below) so the site stays fast and works even if Artwin is briefly down.
- **If it needs a secret key:** don't call Artwin from the browser at all. Instead, add a scheduled **GitHub Action** (e.g. daily) that:
  1. Runs in GitHub's servers, not the browser.
  2. Reads the Artwin key from a **GitHub Actions secret** (`Settings → Secrets and variables → Actions`) — encrypted, never in the repo, never visible in a public clone.
  3. Calls Artwin's API, converts the result into `assets/js/gigs.js`'s existing format.
  4. Commits the updated `gigs.js` (data only — no credential) and pushes.
  - This fits the site as-is: no server to run, no new hosting, and `gigs.js` keeps being just a plain data file, reviewable like today. `npm test` already validates its contents (`tests/smoke.mjs`, check 4), so a bad sync would fail the existing test.
- **Not recommended here:** a live serverless proxy (e.g. a Cloudflare Worker/Netlify function called from the browser) that holds the key and answers requests in real time. It works too, but adds a second hosting platform on top of GitHub Pages for no real benefit over the scheduled-commit approach, since tour dates don't need second-by-second freshness.

**Acceptance criteria (once scoped):**
- No Artwin credential appears anywhere in the git history or in any file served to the browser.
- `gigs.js` keeps its current shape so the rest of the site (sorting, empty state, tests) needs no changes.
- A sync failure (Artwin down, bad data) doesn't break the live site — keep the last good `gigs.js` and fail loudly (e.g. the Action run shows red) rather than publishing broken data.
- `npm test` still passes after a sync.

**Open questions for the requester:**
1. Do you (or the booking agency / Nr. 1 Artiesten) have Artwin API/developer docs, or just the WordPress plugin? The plugin's own settings screen may reveal what kind of key it asks for.
2. Would a daily or hourly automatic sync be frequent enough, or do gigs need to appear within minutes of being added in Artwin?
3. Is there a way to test this against Artwin without risking the agency's live account (a sandbox, or a read-only key)?
