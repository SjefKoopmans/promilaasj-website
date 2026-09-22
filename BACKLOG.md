# Backlog

Requested changes, newest first. The status is at the top of each ticket. The Chronos board (project `promilaasj-website`) carries a short card per ticket; the details live here.

## backlog-20260922-artwin-tour-sync — Auto-update tour dates from Artwin

**Status:** open (research needed) · **Requested:** 2026-09-22

**What:** Pull tour dates automatically from Artwin (the booking-agency system, which has a WordPress plugin) instead of hand-editing `assets/js/gigs.js`. Needs an approach that never puts an Artwin credential in the public repo or in browser-visible code — likely a scheduled GitHub Action that commits an updated `gigs.js`. Full details and open questions in `backlog/backlog-20260922-artwin-tour-sync.md`.

## backlog-20260922-custom-domain-promilaasj-nl — Point promilaasj.nl at the new site

**Status:** ACTION NEEDED BY SJEF · **Requested:** 2026-09-22

**What:** Switch `www.promilaasj.nl` from the current WordPress host to the new GitHub Pages site. GitHub side is ready (repo public, Pages enabled); needs DNS changed at hosting2go.nl, which needs finding out who holds that login. Steps in `backlog/backlog-20260922-custom-domain-promilaasj-nl.md`.

## backlog-20260922-hero-teaser-video — Front page: play the teaser video instead of the "Cover volgt" snippet

**Status:** built (on branch `hero-teaser-video`, not yet merged) · **Requested:** 2026-09-22 · **Built:** 2026-09-22

**What:** Show the uploaded teaser video in the hero's "Zin in Dich" card instead of the "Cover volgt" text placeholder. Full outcome in `backlog/backlog-20260922-hero-teaser-video.md`.

## backlog-20260920-replace-hero-photo — Front page: replace the stage photo (old band members)

**Status:** ACTION NEEDED BY SJEF · **Requested:** 2026-09-20

**What:** `assets/img/hero.webp` still shows the old band members. For now the photo sits at 78% so the singer and band are behind the "Zin in Dich" text. Sjef replaces it with a photo of the current lineup: overwrite `assets/img/hero.webp` (wide, 2000 px or more, WebP under about 200 KB) and tune `background-position` in `.lp-bg` (`assets/css/style.css`). Full steps in `backlog/backlog-20260920-replace-hero-photo.md`.

## backlog-20260920-hero-stage-photo — Front page: bring back the stage photo in the background

**Status:** done · **Requested:** 2026-09-20 · **Closed:** 2026-09-20

**Outcome:** Built. `assets/img/hero.webp` is now the stage photo (182 KB, WebP, preloaded), behind "Opgelet! Zin in Dich" on laptop, wide screens, tablet and phone. On laptop the band and the crowd stay visible between the text and the single card. The photo is darker on phones, where the text spans the full width. A soft dark area behind the text keeps it readable: `npm test` measures the contrast of the text over the photo at 1440, 1024 and 390 px (body text 6+ against 4.5 needed; the orange-red "DICH" 3.9 or more against 3). The photo is still the 2000 x 628 px original, so it is a little soft on big screens; a larger original would improve it.

**What:** The front page should have the photo of the large stage in the background again, behind the "Opgelet! Zin in Dich" text and the single card. The design mockups (1C) had it; the live site does not.

**Why it is missing:** The build uses a generated dark placeholder (`assets/img/hero.webp`) instead of the stage photo. That was a choice made during the build, because the old site had been called out for old pictures, and it was not checked with the requester.

**Source and quality:**
- The stage photo is in the repo at `design/refs/boeken-banner.jpg` (2000 × 628 px, from the old site's upload `Promilaasj-boeken-banner.jpg`).
- It is very wide and only 628 px high. The hero is taller than that, so on a laptop it is stretched to about 1.4× and looks soft, and about 3× on high-resolution phone screens. A larger original (from the photographer or the presskit) would look much better. The presskit banners might be exactly that once the download works.
- The photo shows the earlier lineup on stage. Fine as a background, but worth a look.

**Acceptance criteria:**
- The stage photo is visible behind the hero text on laptop and phone, with the same darkening as in the 1C mockup so the text stays easy to read (contrast checked).
- The important part of the photo (the band on stage) stays in view on a phone, where the hero is tall and narrow.
- The image is optimized (WebP, roughly under 200 KB) and does not slow the first view.
- `npm test` still passes (it checks that all images load).

**Open questions for the requester:**
1. Use the old-site stage photo as is, or is a newer or higher-resolution version available?
2. Which side should show on a phone: the band (left) or the crowd (right)?

**Implementation notes:**
- Convert the photo to `assets/img/hero.webp` (or a new file, then point `.lp-bg` at it in `assets/css/style.css`). The 1C mockup used `background-position: 80% center` with a dark gradient overlay; the overlay already exists in `.lp::after`.
- If the photo stays low-resolution, limit its softness by keeping the hero shorter than the full screen height, or by placing the photo at the top with a fade into the dark background.

## backlog-20260920-embedded-music-player — Music: play the song on the site, not on Spotify

**Status:** done · **Requested:** 2026-09-20 · **Closed:** 2026-09-20

**Outcome:** Resolved by the requester: Limburgs maedje now has its Spotify album id in `index.html` and plays in the page like the other releases. `npm test` now checks that every release turns into a player. The open question about full-length playback for visitors who are not logged in to Spotify (30-second previews) was not answered and is left as it is.

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

**Status:** done · **Requested:** 2026-09-20 · **Closed:** 2026-09-20

**Outcome:** Built. On laptop-size screens (from 980 px wide, with a mouse) every external link opens in a new tab: the nav and footer icons, the Spotify and YouTube buttons, "Open in Spotify", Nr. 1 Artiesten and the tour "Meer info" links. Screen readers are told that the link opens in a new tab. Tablets and phones keep the same tab, and so do the menu, `mailto:`, `tel:` and the video playlist. Resizing a window switches the behavior live. The width is set in `main.js` (search for `laptop`); phones can be added by removing `(hover: hover)` and the width. Covered by `npm test`.

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
