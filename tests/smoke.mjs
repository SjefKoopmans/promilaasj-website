// Rooktest voor de site: starten met `npm test` (na `npm install`).
// Gebruikt de geïnstalleerde Edge of Chrome; kies een ander met BROWSER_CHANNEL=chrome.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2" };

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) throw new Error("outside root");
    await stat(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

let failures = 0;
function check(ok, label, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${!ok && detail ? "  → " + detail : ""}`);
  if (!ok) failures++;
}

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || (process.platform === "win32" ? "msedge" : "chrome") });

async function open(viewport, gigsOverride) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  if (gigsOverride) await page.route("**/assets/js/gigs.js", (r) => r.fulfill({ contentType: "text/javascript", body: gigsOverride }));
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page, problems };
}

// 1. Structuur en volgorde van de secties
{
  const { ctx, page, problems } = await open({ width: 1440, height: 900 });
  const ids = await page.$$eval("main > section", (s) => s.map((e) => e.id));
  check(JSON.stringify(ids) === JSON.stringify(["top", "tour", "muziek", "video", "boeken"]), "secties in de afgesproken volgorde", ids.join(", "));
  check((await page.textContent("h1")).replace(/\s+/g, " ").trim() === "Zin in Dich", "h1 is 'Zin in Dich'");
  check((await page.locator("text=Opgelet!").count()) > 0, "OPGELET-aankondiging staat bovenaan");

  // scroll door de hele pagina zodat lazy afbeeldingen laden, controleer dan of ze echt bestaan
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); } });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 10000 }).catch(() => {});
  const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute("src")));
  check(broken.length === 0, "alle afbeeldingen laden (geen lege of kapotte bestanden)", broken.join(", "));
  check(problems.length === 0, "geen console-fouten, CSP-meldingen of 404's", problems.slice(0, 3).join(" | "));
  await ctx.close();
}

// 2. Geen horizontaal scrollen op computer, tablet en smalle telefoons
for (const w of [1440, 900, 390, 320]) {
  const { ctx, page } = await open({ width: w, height: 800 });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(over <= 0, `geen horizontaal scrollen bij ${w}px`, `${over}px te breed`);
  // niets mag buiten zijn eigen kaart of sectie steken (bijv. een afgeknipte kop)
  const clipped = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".book h2, .book .book-lede, .contact p, .gig h3, .rel h3, .lp h1 .line").forEach((el) => {
      const range = document.createRange(); range.selectNodeContents(el);
      const r = range.getBoundingClientRect(); const box = el.closest(".book, .contact > div, .gig, .rel, .lp-copy");
      if (box && r.right > box.getBoundingClientRect().right + 1) out.push(el.className || el.tagName);
    });
    return out;
  });
  check(clipped.length === 0, `geen tekst buiten de kaart bij ${w}px`, clipped.join(", "));
  await ctx.close();
}

// 3. Agenda: sorteren, verlopen optredens verbergen, veilig tonen
{
  const data = `window.GIGS=[
    {date:"2999-11-11",title:"11e van de 11e <b>x</b>",venue:"Markt",city:"Roermond",url:"https://example.com/kaarten"},
    {date:"2000-01-01",title:"Al geweest",city:"Nergens"},
    {date:"2999-02-03",title:"Vastelaovend",city:"Sittard",url:"https://…"},
    {date:"2999-02-30",title:"Bestaat niet"},
    {date:"2999-03-04",title:"Javascript-link",url:"javascript:alert(1)"}];`;
  const { ctx, page } = await open({ width: 1200, height: 800 }, data);
  const titles = await page.$$eval("#gigs .gig h3", (n) => n.map((e) => e.textContent));
  check(JSON.stringify(titles) === JSON.stringify(["Vastelaovend", "Javascript-link", "11e van de 11e <b>x</b>"]), "agenda: gesorteerd, verleden en onmogelijke datums weg", JSON.stringify(titles));
  const links = await page.$$eval("#gigs a", (n) => n.map((e) => e.href));
  check(JSON.stringify(links) === JSON.stringify(["https://example.com/kaarten"]), "agenda: alleen echte https-links (plaatshouder '…' en javascript: genegeerd)", JSON.stringify(links));
  check((await page.getAttribute("#gigs a", "target")) === "_blank", "agenda: 'Meer info' opent op een laptop in een nieuw tabblad");
  check((await page.$$("#gigs .gig b")).length === 0, "agenda: tekst wordt niet als HTML geïnterpreteerd");
  check(await page.isHidden("#gigs-empty"), "agenda: lege melding verborgen zodra er optredens zijn");
  await ctx.close();

  const none = await open({ width: 1200, height: 800 }, "window.GIGS=[];");
  check(await none.page.isVisible("#gigs-empty"), "agenda: nette melding zonder optredens");
  await none.ctx.close();
}

// 4. De echte agenda (assets/js/gigs.js) is netjes ingevuld
{
  const src = await readFile(join(ROOT, "assets/js/gigs.js"), "utf8");
  const gigs = new Function("window", src + "; return window.GIGS;")({});
  const bad = [];
  const warn = [];
  gigs.forEach((g, i) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(g.date || "");
    const d = m && new Date(+m[1], +m[2] - 1, +m[3]);
    if (!d || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) bad.push(`regel ${i + 1}: datum "${g.date}" is geen echte datum`);
    if (!g.title) bad.push(`regel ${i + 1}: titel ontbreekt`);
    if (g.url && !/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(g.url)) warn.push(`regel ${i + 1} ("${g.title}"): link "${g.url}" is een plaatshouder en wordt genegeerd`);
  });
  warn.forEach((w) => console.log("WARN  gigs.js " + w));
  check(bad.length === 0, `gigs.js: ${gigs.length} optredens, allemaal geldig`, bad.join("; "));
}

// 5. Menu op de telefoon, Spotify- en YouTube-spelers
{
  const { ctx, page, problems } = await open({ width: 390, height: 844 });
  check(await page.isHidden("#menu"), "telefoon: menu is dicht");
  await page.click(".nav-toggle");
  check(await page.isVisible("#menu") && (await page.getAttribute(".nav-toggle", "aria-expanded")) === "true", "telefoon: menu opent");
  await page.click('#menu a[href="#video"]');
  await page.waitForTimeout(300);
  check(await page.isHidden("#menu"), "telefoon: menu sluit na een klik");
  await page.keyboard.press("Escape");
  await ctx.close();
}
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  const releases = await page.$$eval("[data-spotify]", (n) => n.map((e) => ({ id: e.getAttribute("data-spotify"), title: e.getAttribute("data-title") })));
  check((await page.locator("iframe").count()) === 0, "Spotify: nog niets geladen voor de klik");
  for (const r of releases) {
    await page.click(`[data-spotify="${r.id}"] .cd`);
    const sp = await page.getAttribute(`[data-spotify="${r.id}"] iframe`, "src");
    check(sp === `https://open.spotify.com/embed/album/${r.id}`, `Spotify: '${r.title}' speelt in de pagina na een klik`, String(sp));
  }
  const cards = await page.locator("#muziek .rel").count();
  check(cards === releases.length && cards > 0, `Spotify: elke uitgave (${cards}) heeft een speler`, `${releases.length} van ${cards}`);
  check(page.url() === BASE, "Spotify: bezoeker blijft op de site");

  check((await page.locator("#feat iframe").count()) === 0, "YouTube: nog niets geladen voor de klik");
  await page.click("#feat-btn");
  check((await page.getAttribute("#feat iframe", "src")).startsWith("https://www.youtube-nocookie.com/embed/NfcCfGOxz0o"), "YouTube: uitgelichte video speelt na een klik");
  await page.click('#playlist [data-yt="O1SFRd0IQ8I"]');
  check((await page.getAttribute("#feat iframe", "src")).includes("O1SFRd0IQ8I"), "YouTube: afspeellijst wisselt van video");
  check((await page.getAttribute('#playlist [data-yt="O1SFRd0IQ8I"]', "class")).includes("is-active") && (await page.textContent("#feat-title")) === "Promo Promilaasj Tour 2020", "YouTube: actieve video is gemarkeerd");
  await ctx.close();
}

// 7. Links: op een laptop in een nieuw tabblad, op telefoon en tablet in hetzelfde tabblad
const EXTERNAL = 'a[href^="https://"]:not([data-yt])';
async function linkState(page) {
  return page.evaluate((sel) => {
    const ext = [...document.querySelectorAll(sel)];
    const other = [...document.querySelectorAll('a[href^="#"], a[href^="mailto:"], a[href^="tel:"], a[data-yt]')];
    return {
      total: ext.length,
      withTarget: ext.filter((a) => a.target === "_blank").length,
      withoutNoopener: ext.filter((a) => a.target === "_blank" && !a.rel.split(" ").includes("noopener")).length,
      otherWithTarget: other.filter((a) => a.hasAttribute("target")).length,
      unannounced: ext.filter((a) => a.target === "_blank" && !/opent in een nieuw tabblad/.test(a.getAttribute("aria-label") || a.textContent)).length,
    };
  }, EXTERNAL);
}
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await ctx.route(/^https:\/\/(?!127\.)/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>extern</title>" }));
  const st = await linkState(page);
  check(st.total >= 12 && st.withTarget === st.total, `laptop: alle ${st.total} externe links openen in een nieuw tabblad`, `${st.withTarget} van ${st.total}`);
  check(st.withoutNoopener === 0, "laptop: nieuwe tabbladen kunnen de site niet aansturen (rel=noopener)", JSON.stringify(st));
  check(st.otherWithTarget === 0, "laptop: menu (#...), mailto:, tel: en de video-afspeellijst blijven zoals ze zijn");
  check(st.unannounced === 0, "laptop: schermlezers horen dat een link in een nieuw tabblad opent");

  const [popup] = await Promise.all([ctx.waitForEvent("page"), page.click('.nav-social a[href*="facebook.com"]')]);
  await popup.waitForLoadState();
  check(popup.url().includes("facebook.com") && page.url() === BASE, "laptop: klik opent Facebook in een nieuw tabblad, de site blijft open");
  await popup.close();

  const before = ctx.pages().length;
  await page.click('.nav-links a[href="#video"]');
  check(ctx.pages().length === before && page.url() === BASE + "#video", "laptop: menu naar een sectie blijft in hetzelfde tabblad");

  await page.setViewportSize({ width: 700, height: 900 });
  await page.waitForTimeout(200);
  check((await linkState(page)).withTarget === 0, "verkleinen naar tablet-breedte: links weer in hetzelfde tabblad");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const back = await linkState(page);
  check(back.withTarget === back.total && back.unannounced === 0, "weer op laptop-breedte: links weer in een nieuw tabblad");
  await ctx.close();
}
for (const w of [900, 390]) {
  const { ctx, page } = await open({ width: w, height: 800 });
  const st = await linkState(page);
  check(st.withTarget === 0, `${w}px (tablet/telefoon): links blijven in hetzelfde tabblad`, `${st.withTarget} met target`);
  await ctx.close();
}

// 6. Toetsenbord: skip-link en tabvolgorde beginnen bij de inhoud
{
  const { ctx, page } = await open({ width: 1440, height: 900 });
  await page.keyboard.press("Tab");
  check((await page.evaluate(() => document.activeElement.className)) === "skip", "toetsenbord: eerste Tab is de 'Naar de inhoud'-link");
  await ctx.close();
}

// 8. Voorpagina: de foto van het podium staat erachter en de tekst blijft goed leesbaar
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

// Hoe licht is de foto achter een stuk tekst? Verberg de tekst, kijk naar de pixels erachter (90e percentiel).
async function backgroundBehind(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  const setHidden = (hide) => page.evaluate((h) => document.querySelectorAll(".lp-copy, .single").forEach((e) => { e.style.visibility = h ? "hidden" : ""; }), hide);
  await setHidden(true);
  const png = await page.screenshot({ clip: box });
  await setHidden(false);
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const ls = [];
    for (let i = 0; i < d.length; i += 4) ls.push(0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]));
    ls.sort((a, b) => a - b);
    return ls[Math.floor(ls.length * 0.9)];
  }, png.toString("base64"));
}

{
  const size = (await stat(join(ROOT, "assets/img/hero.webp"))).size;
  check(size <= 250 * 1024, `voorpagina: de achtergrondfoto is licht genoeg (${Math.round(size / 1024)} KB, maximaal 250 KB)`);
}
for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
  const { ctx, page } = await open({ width: w, height: h });
  await page.waitForFunction(() => getComputedStyle(document.querySelector(".lp-bg")).backgroundImage.includes("hero.webp"));
  await page.waitForTimeout(400);
  const cases = [
    [".lp .lede", lum([226, 226, 230]), 4.5, "gewone tekst"],
    [".lp h1 .line:not(.grad)", 1, 3, "grote titel"],
    [".lp h1 .grad", lum([255, 45, 61]), 3, "grote titel in kleur"],
  ];
  for (const [selector, textLum, needed, what] of cases) {
    const bg = await backgroundBehind(page, selector);
    const ratio = contrast(textLum, bg);
    check(ratio >= needed, `voorpagina ${w}px: ${what} leesbaar over de foto (contrast ${ratio.toFixed(1)}, minimaal ${needed})`);
  }
  await ctx.close();
}

await browser.close();
server.close();
console.log(failures ? `\n${failures} test(s) mislukt` : "\nAlles OK");
process.exit(failures ? 1 : 0);
