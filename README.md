# Promilaasj website

One-page Dutch site for the band Promilaasj, built on design 1C. Plain HTML, CSS and a little JavaScript: no framework and no build step. Fonts are hosted with the site, there are no cookies, and Spotify and YouTube only load after a visitor clicks play.

Sections, in order: OPGELET (new single Zin in Dich) → Tour → Muziek → Video → Boeken and contact.

## Preview

```
python -m http.server 8000
```

Open http://localhost:8000.

## Publish

Upload the whole folder to any static host with `index.html` at the root. The share and search info in `index.html` assumes `https://www.promilaasj.nl/`.

## Keeping it up to date

| What | Where |
| --- | --- |
| Add or change a gig | `assets/js/gigs.js`, one line per gig (the format is explained in the file). Gigs whose date has passed disappear by themselves. Leave out `url` if there is no link. |
| Hero photo | Overwrite `assets/img/hero.webp` (about 1600 px wide, WebP). It is a generated placeholder now. |
| Cover of "Zin in Dich" | Save it as `assets/img/zin-in-dich.webp` and follow the comment in `index.html` (search for "Cover volgt"). |
| Band photo (booking section) | Overwrite `assets/img/band.webp`. |
| Add or change a release | Copy an `<article class="rel">` block in `index.html`. Give it a `data-spotify="<album id>"` to get a player (the id is the part after `/album/` in the Spotify link). |
| Add or change a video | Copy a `<li>` in the playlist in `index.html` (YouTube id and title) and add a thumbnail as `assets/img/video-<id>.jpg`. |
| Which links open in a new tab | `assets/js/main.js`, search for `laptop`. Now: external links, on screens from 980 px wide with a mouse. |
| Booking and contact details | The `#boeken` section of `index.html`. |

## Tests

```
npm install
npm test
```

Checks the section order, that every image really loads, no sideways scrolling from 320 px up, the agenda logic, the phone menu and the Spotify and YouTube players. It also validates `assets/js/gigs.js`, so a typo in a date is reported instead of silently hiding a gig. It uses the installed Edge or Chrome (`BROWSER_CHANNEL=chrome` to choose).

## Other things in this repo

- `design/` keeps all design options (round 1 and round 2) as mockups, PDFs and previews, for the future. It is not part of the live site.
- `BACKLOG.md` lists tickets that are not built yet.
- `assets/img/presskit 2026/` is not used by the site.
