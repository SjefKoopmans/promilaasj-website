// Haalt de tourdata op uit Artwin Live en schrijft assets/js/gigs.js opnieuw.
// Wordt aangeroepen door .github/workflows/sync-gigs.yml (elke dag, en handmatig via "Run workflow").
//
// Veiligheid: de widget-URL (env ARTWIN_ICAL_URL, een GitHub Actions secret) levert het VOLLEDIGE
// boekingsobject van Artwin, inclusief venue- en booking-telefoonnummers en adressen. Dit script
// laat alleen de velden door die al in gigs.js stonden (date, title, venue, city, url) — de rest
// wordt bewust nooit weggeschreven, ook niet als Artwin in de toekomst meer velden toevoegt.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "assets/js/gigs.js");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const url = process.env.ARTWIN_ICAL_URL;
if (!url) {
  console.error("FOUT: env var ARTWIN_ICAL_URL ontbreekt (moet een GitHub Actions secret zijn). gigs.js blijft ongewijzigd.");
  process.exit(1);
}

let raw;
try {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  raw = await res.json();
} catch (err) {
  console.error(`FOUT bij ophalen van Artwin: ${err.message}. gigs.js blijft ongewijzigd.`);
  process.exit(1);
}

if (!Array.isArray(raw)) {
  console.error(`FOUT: onverwachte vorm van het antwoord (geen lijst). gigs.js blijft ongewijzigd.`);
  process.exit(1);
}

// Alleen https-links doorlaten (net als de rest van de site); Artwin geeft soms "" terug.
const isHttpsUrl = (u) => typeof u === "string" && /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(u);

// Artwin geeft namen soms HTML-encoded terug (bijv. &quot;) terwijl dit platte tekst wordt op de site.
const NAMED_ENTITIES = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
function decodeEntities(s) {
  if (typeof s !== "string") return s;
  return s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, code) => {
    if (code[0] === "#") {
      const cp = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? m;
  });
}

const skipped = [];
const gigs = raw
  .filter((g) => {
    if (g && g.private === "1") { skipped.push(`${g.gig_id ?? "?"}: private boeking, overgeslagen`); return false; }
    return true;
  })
  .map((g) => {
    const date = typeof g.date_start === "string" ? g.date_start.slice(0, 10) : "";
    const title = decodeEntities((g.event?.title || "").trim() || (g.venue?.name || "").trim());
    const venue = decodeEntities((g.venue?.name || "").trim());
    const city = decodeEntities((g.venue?.city || "").trim());
    const ticketUrl = isHttpsUrl(g.event?.website_tickets) ? g.event.website_tickets : isHttpsUrl(g.event?.website) ? g.event.website : "";
    return { gig_id: g.gig_id, date, title, venue, city, url: ticketUrl };
  })
  .filter((g) => {
    if (!DATE_RE.test(g.date) || !g.title) { skipped.push(`${g.gig_id ?? "?"}: geen geldige datum of titel, overgeslagen`); return false; }
    return true;
  })
  .sort((a, b) => a.date.localeCompare(b.date));

if (raw.length > 0 && gigs.length === 0) {
  console.error(`FOUT: Artwin gaf ${raw.length} boeking(en) terug, maar geen enkele kon worden omgezet (mapping waarschijnlijk stuk). gigs.js blijft ongewijzigd.`);
  skipped.forEach((s) => console.error("  " + s));
  process.exit(1);
}

skipped.forEach((s) => console.log("Overgeslagen: " + s));

const lines = gigs.map((g) => {
  const parts = [`date: ${JSON.stringify(g.date)}`, `title: ${JSON.stringify(g.title)}`];
  if (g.venue) parts.push(`venue: ${JSON.stringify(g.venue)}`);
  if (g.city) parts.push(`city: ${JSON.stringify(g.city)}`);
  if (g.url) parts.push(`url: ${JSON.stringify(g.url)}`);
  return `\t{ ${parts.join(", ")} },`;
});

const content = `// Agenda van Promilaasj.
// Dit bestand wordt automatisch bijgewerkt vanuit Artwin Live door
// .github/workflows/sync-gigs.yml (zie ook backlog/backlog-20260922-artwin-tour-sync.md).
// Handmatige wijzigingen hier worden bij de volgende sync overschreven — voeg een optreden
// toe of wijzig het in Artwin Live, niet hier. Staat de sync (tijdelijk) uit, dan kun je dit
// bestand net als vroeger gewoon met de hand bijwerken; het format hieronder blijft hetzelfde.
//
// date  = JJJJ-MM-DD (verplicht)   title = naam van het optreden (verplicht)
// venue, city, url = optioneel     (url = link naar kaartverkoop of eventpagina)
window.GIGS = [
${lines.join("\n")}
];
`;

await writeFile(OUT_FILE, content, "utf8");
console.log(`gigs.js bijgewerkt: ${gigs.length} optreden(en) (van ${raw.length} boeking(en) uit Artwin, ${skipped.length} overgeslagen).`);
