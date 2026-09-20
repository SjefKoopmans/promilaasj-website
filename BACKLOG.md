# Backlog

Tickets that are not built yet. Newest first. The Chronos board (project `promilaasj-website`) carries a short card per ticket; the details live here.

## backlog-20260920-embedded-music-player — Music: play the song on the site, not on Spotify

**Status:** backlog (not started) · **Requested:** 2026-09-20

**What:** Clicking on the music should play the song in an **embedded player on the site**, not send the visitor to Spotify.

**Where it stands today (checked in the code):**
- Rockjesdaag, Neet allein and Promilaasj already open an embedded Spotify player when you click the cover or the red play button.
- **Limburgs maedje** does not: no Spotify album or track link is known for it, so its cover and play button link to the Spotify artist page. This is most likely the case the request is about.
- The small "Open in Spotify" text links and the "Alles op Spotify" button also go to Spotify. They were meant as secondary links.

**What is needed:**
- The Spotify link (album or track) for Limburgs maedje, and for any new release. The embed then works the same as for the EPs. The site currently only builds album players, so track links need a small addition.

**Acceptance criteria:**
- Clicking the cover or the play button of every release, including Limburgs maedje, plays it in the page. The visitor stays on the site.
- The player still loads only after the click (fast page, no tracking before that) and can be used with the keyboard.
- `npm test` checks that each release turns into a player and does not navigate away.

**Open questions for the requester:**
1. What is the Spotify link of Limburgs maedje (album or track)? Are there other songs that should get a player?
2. Full songs: Spotify's embedded player generally plays the full song only for visitors who are logged in to Spotify. Everyone else hears a 30-second preview. Is that acceptable? If every visitor should hear the whole song without Spotify, the options are: (a) put an audio file on the site with its own player (needs the band's own audio files and rights), or (b) embed a YouTube version (music video or audio upload).
3. Should the "Open in Spotify" links stay as a secondary link, or go?

**Implementation notes:**
- Give the Limburgs maedje `<article>` a `data-spotify` id and make its cover and play control the same `<button>`s as the other releases (in `index.html`, currently plain links). For a track, use `https://open.spotify.com/embed/track/<id>` in `assets/js/main.js`.
- For option (a) or (b) above the player code needs a small extension; the click-to-load pattern stays.

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
