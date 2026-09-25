// Gedeeld door de tour-mockups (ronde 3). Zelfde regels als assets/js/main.js:
// alleen toekomstige optredens met een echte datum, oplopend, en daarna gegroepeerd per jaar.
window.TOUR = (function () {
  var MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var MONTHS_LONG = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
  var DAYS = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  function safeUrl(u) {
    return typeof u === "string" && /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]\S*)?$/i.test(u) ? u : "";
  }
  function realDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return d.getFullYear() === +s.slice(0, 4) && d.getMonth() === +s.slice(5, 7) - 1 && d.getDate() === +s.slice(8, 10) ? d : null;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var years = [];
  (window.GIGS || [])
    .filter(function (g) { return g && g.title && g.date >= today && realDate(g.date); })
    .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
    .forEach(function (g) {
      var d = realDate(g.date);
      var last = years[years.length - 1];
      if (!last || last.year !== d.getFullYear()) years.push(last = { year: d.getFullYear(), gigs: [] });
      last.gigs.push({
        d: d,
        day: DAYS[d.getDay()],
        month: MONTHS[d.getMonth()],
        monthLong: MONTHS_LONG[d.getMonth()],
        title: g.title,
        where: [g.venue, g.city].filter(Boolean).join(" · "),
        city: g.city || "",
        option: !!g.option,
        url: safeUrl(g.url)
      });
    });

  return { years: years, el: el };
})();
