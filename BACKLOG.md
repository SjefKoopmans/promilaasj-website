# Backlog

Tickets that are not built yet. Newest first. The Chronos board (project `promilaasj-website`) carries a short card per ticket; the details live here.

## backlog-20260920-links-new-tab — Laptop: open links in a new tab

**Status:** backlog (not started) · **Requested:** 2026-09-20

**What:** On the laptop version of the site, clicking a link should open it in a **new tab**, not replace the site in the current tab.

**Which links (proposal, to confirm):**
- External links: Instagram, Facebook, YouTube, Spotify (nav icons, footer, "Open in Spotify", "Alles op Spotify", "Meer op YouTube"), Nr. 1 Artiesten, and the tour "Meer info" links.
- Stay in the same tab: the menu and buttons that scroll within the page (`#tour`, `#muziek`, `#video`, `#boeken`, "Terug naar boven").
- `mailto:` and `tel:` links are not pages, so they are left alone.

**Acceptance criteria:**
- On a laptop or desktop screen, every external link opens in a new tab and the site stays open in the old one.
- The new tab cannot control the site tab (`rel="noopener"`, which the links already have).
- In-page navigation still works as before.
- Keyboard users still get the normal behavior (Enter opens the link, focus stays visible).
- The automated test (`npm test`) checks this so it cannot silently regress.

**Open questions for the requester:**
1. "Laptop version" means what exactly: any screen from 980 px wide (where the floating menu shows the social icons), or only devices with a mouse? And should phones keep opening links in the same tab?
2. Should the tour "Meer info" links also open in a new tab? (Assumed yes.)

**Implementation notes:**
- Simplest: add `target="_blank"` to the external links in `index.html` (they all have `rel="noopener"` already) and to the "Meer info" links created in `assets/js/main.js`.
- If phones must stay as they are: set `target` from `main.js` only when `matchMedia("(min-width: 980px) and (hover: hover)")` matches, and update it on resize.
- Add a check to `tests/smoke.mjs`: on a 1440 px viewport every `a[href^="https://"]` has `target="_blank"`; on 390 px (if phones stay as they are) none do.
