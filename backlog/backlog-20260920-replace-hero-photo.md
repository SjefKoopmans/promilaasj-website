# backlog-20260920-replace-hero-photo — Front page: replace the stage photo (old band members)

**Status:** ACTION NEEDED BY SJEF · **Requested:** 2026-09-20

**What:** The front-page background photo (`assets/img/hero.webp`) still shows the old band members. For now the photo sits at 78% so the singer and band are behind the "Zin in Dich" text. Replace it with a photo of the current lineup.

**Action for Sjef:**
1. Get a new wide photo of the current band (at least 2000 px wide, landscape, dark or stage-lit works best).
2. Convert it to WebP, roughly under 200 KB, and overwrite `assets/img/hero.webp` (same name: the page and the preload already point at it).
3. Tune `background-position` in `.lp-bg` (`assets/css/style.css`, search for `hero.webp`; now `78% center`) until the band looks right on laptop, wide screen and phone. Lower = photo moves right, higher = photo moves left.
4. Run `npm test` (it checks that the text stays readable over the photo).

**Notes:**
- Returning visitors may keep seeing the old photo for a while because the file name stays the same. To avoid that, save it under a new name and update `.lp-bg` in `assets/css/style.css` and the `<link rel="preload">` in `index.html`.
- `assets/img/og.jpg` (the picture in link previews) is separate and may also show the old lineup.
- `assets/img/band.webp` (booking section) and the videos are other places with band pictures; check them at the same time.
- Adding a second picture next to this one (instead of replacing it) needs a code change.
