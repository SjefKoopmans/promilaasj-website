# Design options (round 1)

Open `Promilaasj-ontwerpen.pdf` (7 pages: overview, then desktop and phone view of each design), or the images in `previews/`.

| # | Name | Idea |
| --- | --- | --- |
| 1 | Vertrouwd | Every element of the old site (grey header with black wordmark, panorama in a black frame, CD sleeves, Instagram grid, Nr.1 and Demo logos), in the new order |
| 2 | Modern | Dark, large type, glass cards, gradient accents, floating pill navigation |
| 3 | Kroegposter | Warning sign and caution tape for "OPGELET!", tear-off tour tickets, beer-coaster EPs, film-strip videos |

Section order in all three: OPGELET (Zin in Dich) → Tour → Muziek → Video → Boeken and contact.

The `.html` files are static mockups (open them in a browser). Photos in them are stand-ins taken from the old site and its Instagram (`refs/`); the final site uses the new band photo. `refs/` and the mockups are not part of the live site.

## Round 2: variants on design 1

Design 1 was chosen. `1-vertrouwd.html` is unchanged. Two variants add the landing page of design 2 (OPGELET chip, huge "Zin in Dich" title, glass single card):

| # | File | Idea |
| --- | --- | --- |
| 1 | `1-vertrouwd.html` | Unchanged |
| 1B | `1b-vertrouwd-landing.html` | Design 1 with only the landing page of design 2 (smallest step) |
| 1C | `1c-vertrouwd-modern.html` | Design 1 on a modern base: floating menu, big-date tour cards, CD sleeves on rounded cards, featured video plus playlist, gradient booking card |

Overview and details: `Promilaasj-ontwerpen-ronde-2.pdf`, images in `previews/ronde-2/`.

## Round 3: tour section, one column per year

The tour section was too long (about 3,600 px on a laptop and 7,200 px on a phone). All three options list every upcoming date in one column per year. They use the live `assets/css/style.css` and `assets/js/gigs.js` with the same filtering as the site, and the shared helper `tour-data.js`.

| # | File | Idea | Height (laptop / phone) |
| --- | --- | --- | --- |
| 4A | `4a-tour-kolommen.html` | One white card with a column per year and one compact row per show. On a phone you swipe between years | ~1,790 / ~1,650 px |
| 4B | `4b-tour-agenda.html` | No cards. The columns sit on the grey background, grouped by month, one line per show. On a phone there are year tabs | ~1,360 / ~450 px (per year) |
| 4C | `4c-tour-jaarkaarten.html` | A card per year with a gradient header and small big-date numbers (today's style, scaled down). Each year shows at most 5 dates, with "Toon alle" to expand. On a phone the cards stack | ~930 / ~2,000 px |

Screenshots are in `previews/ronde-3/`.

**Chosen: 4C (Jaarkaarten).** It is now built into the live site (`assets/js/main.js`, `assets/css/style.css`). Each year first shows 3 dates on a phone and 5 from 720 px wide; "Toon alle" shows the rest. The tour section is now about 940 px tall on a laptop and 1,710 px on a phone. For how it looks on the whole site, see `previews/ronde-3/4c-overzicht.jpg` (laptop and phone side by side), or the full-page `4c-overzicht-desktop.jpg` and `4c-overzicht-mobiel.jpg`. Close-ups of just the tour: `4c-tour-desktop.jpg` and `4c-tour-mobiel.jpg`.
