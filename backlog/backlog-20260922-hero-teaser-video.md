# backlog-20260922-hero-teaser-video — Front page: play the teaser video instead of the "Cover volgt" snippet

**Status:** open · **Requested:** 2026-09-22

**What:** In the hero section, the "ZIN IN DICH — Cover volgt" card should show the teaser video the user uploaded instead of the placeholder text card.

**Source:** `assets/img/zin_in_dich_teaser.mp4` (uploaded 2026-09-22, ~620 KB).

**Where it is today (checked in the code):** `index.html`, the `<figure class="glass single">` block right after the hero heading. It currently renders a plain `.cover` div with "Zin in Dich" text and "Cover volgt", per the existing comment in the file:
`<!-- Cover volgt: vervang .cover door <img class="cover" src="assets/img/zin-in-dich.webp" alt="Cover van Zin in Dich"> -->`
That comment assumed a still cover image would replace it; this ticket replaces it with a video instead.

**Acceptance criteria:**
- The card plays `zin_in_dich_teaser.mp4` in place of the current text placeholder, at the same size/position (rotated "single" card look).
- Video autoplays muted and loops (no sound, no controls needed) so it behaves like a moving cover, and pauses respectfully for `prefers-reduced-motion` users (show a static poster frame instead).
- Works on phone, tablet and laptop; doesn't break the layout of the card or the "Binnenkort" badge below it.
- Video file is reasonably compressed (already small at ~620 KB; check it still loads fast on mobile).
- `npm test` still passes.

**Open questions for the requester:**
1. Should the "Binnenkort" badge and the "Cover volgt" wording stay, or does the video replace "Cover volgt" entirely (e.g. badge says something else once there's a teaser)?
2. Any sound in the video, or should it stay muted/silent on the page?
3. Is `assets/img/` the right home for it long-term, or should video assets move to something like `assets/video/`?

**Implementation notes:**
- Move the file to `assets/video/zin-in-dich-teaser.mp4` (video doesn't really belong under `img/`) and update the reference, unless the requester prefers to leave it in place.
- Replace `.cover` with a `<video>` element: `autoplay muted loop playsinline poster="...">`, keeping the `.cover` sizing/shape classes so the rotated card frame is unchanged.
- Provide a poster frame (a still exported from the video) for `prefers-reduced-motion` and for the moment before the video loads.
- Add a smoke-test check that the `<video>` element exists and its source file returns 200.
