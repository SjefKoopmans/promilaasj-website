# backlog-20260922-hero-teaser-video — Front page: play the teaser video instead of the "Cover volgt" snippet

**Status:** built (on branch `hero-teaser-video`) · **Requested:** 2026-09-22 · **Built:** 2026-09-22

**Outcome:** The "Cover volgt" placeholder is now a `<video>` (`assets/video/zin-in-dich-teaser.mp4`, moved out of `assets/img/`) with a poster frame (`assets/img/zin-in-dich-teaser-poster.jpg`, grabbed from the video itself). It loops on phone, tablet and laptop, keeps the rotated "single" card look, and stays paused on the poster frame for visitors with "reduce motion" set. The "Zin in Dich" / "Binnenkort" caption is unchanged (open question 1 below).

**Sound (2026-09-22 update):** at the requester's request the video now tries to autoplay **with sound**; almost every browser blocks autoplay-with-sound without a click, so in practice it falls back to muted and loops as before. A small round toggle button in the bottom-right corner of the card (speaker icon, `.mute-toggle`) lets the visitor turn the sound on or off at any time; it reflects and controls the video's actual muted state and updates its icon and `aria-label`/`aria-pressed` accordingly.

`npm test` has checks for all of this (loads, loops, has a poster, falls back to muted, the toggle button's states and click behavior, and the reduced-motion case, which stays paused and muted) and passes; a pre-existing, unrelated failure in the tour-dates check (`gigs.js`, some rows still missing a title) is not part of this ticket. Not yet merged into `build-1c`.

**What:** In the hero section, the "ZIN IN DICH — Cover volgt" card should show the teaser video the user uploaded instead of the placeholder text card.

**Source:** `assets/img/zin_in_dich_teaser.mp4` (uploaded 2026-09-22, ~620 KB).

**Where it is today (checked in the code):** `index.html`, the `<figure class="glass single">` block right after the hero heading. It currently renders a plain `.cover` div with "Zin in Dich" text and "Cover volgt", per the existing comment in the file:
`<!-- Cover volgt: vervang .cover door <img class="cover" src="assets/img/zin-in-dich.webp" alt="Cover van Zin in Dich"> -->`
That comment assumed a still cover image would replace it; this ticket replaces it with a video instead.

**Acceptance criteria:**
- The card plays `zin_in_dich_teaser.mp4` in place of the current text placeholder, at the same size/position (rotated "single" card look).
- Video loops, tries to play with sound, and falls back to muted where the browser blocks that; a visible toggle lets the visitor turn sound on or off at will. Pauses respectfully for `prefers-reduced-motion` users (show a static poster frame instead).
- Works on phone, tablet and laptop; doesn't break the layout of the card or the "Binnenkort" badge below it.
- Video file is reasonably compressed (already small at ~620 KB; check it still loads fast on mobile).
- `npm test` still passes.

**Open questions for the requester:**
1. Should the "Binnenkort" badge and the "Cover volgt" wording stay, or does the video replace "Cover volgt" entirely (e.g. badge says something else once there's a teaser)? *(unchanged, still open)*
2. Is `assets/img/` the right home for it long-term, or should video assets move to something like `assets/video/`? *(resolved: moved to `assets/video/`)*

**Implementation notes:**
- Video lives at `assets/video/zin-in-dich-teaser.mp4`, `.cover` on the `<video>` (`loop playsinline poster="...">`), inside a `.cover-frame` wrapper that anchors the `.mute-toggle` button.
- `assets/js/main.js` (search "Teaservideo") sets `muted = false` and calls `.play()`; if the promise rejects (autoplay-with-sound blocked), it falls back to muted and keeps the toggle's icon/label/`aria-pressed` in sync with the video's real `muted` state.
- Poster frame: a still exported from the video (see `backlog/`-adjacent tooling notes if it needs regenerating for a new video).
- `npm test` has a check for the video's state, the toggle's click behavior, and the reduced-motion case.
