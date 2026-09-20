# Promilaasj website

One-page Dutch site for the band Promilaasj. Plain HTML, CSS and a little JavaScript: no framework, no build step, no cookies, no third-party requests until a visitor clicks play.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Upload the whole folder to any static host (the current hosting, Netlify, GitHub Pages, ...). `index.html` must be at the root. The Open Graph and JSON-LD URLs in `index.html` assume `https://www.promilaasj.nl/`.

## Keeping it up to date

| What | Where |
| --- | --- |
| Add a gig | `assets/js/gigs.js` (one line per gig, format explained in the file). Past gigs hide themselves. |
| New band photo | Save as `assets/img/bandfoto.jpg`, then enable the commented `bandfoto.jpg` line in `.hero` in `assets/css/style.css`. |
| New EP | Copy an `<article class="card music">` block in `index.html`, change the Spotify album id and cover (`assets/img/`, 400x400 WebP). |
| New video | Copy a `<div class="card video">` block in `index.html`, change the YouTube id and title. |
| Booking / contact details | The `#boeken` and `#contact` sections of `index.html`. |

## Notes

- Fonts (Anton, Barlow) are self-hosted in `assets/fonts/`.
- A Content-Security-Policy meta tag limits the page to itself plus Spotify and YouTube (no-cookie) embeds, and YouTube thumbnails. If you add another embed, allow it there.
- The logo (`assets/img/logo.png`) is only 216 px wide, taken from the old site. A larger or vector version would look sharper in the hero and the share image (`og.jpg`).
