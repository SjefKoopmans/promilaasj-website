(function () {
  "use strict";

  // ---------- Mobiel menu ----------
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav")) setMenu(false);
  });

  // ---------- Spotify: pas laden na een klik (sneller, geen tracking vooraf) ----------
  var SPOTIFY_ID = /^[A-Za-z0-9]{10,30}$/;
  document.querySelectorAll("[data-spotify]").forEach(function (card) {
    var id = card.getAttribute("data-spotify");
    if (!SPOTIFY_ID.test(id)) return;
    function load() {
      var cd = card.querySelector(".cd");
      if (!cd) return;
      var frame = document.createElement("iframe");
      frame.src = "https://open.spotify.com/embed/album/" + id;
      frame.title = (card.getAttribute("data-title") || "EP") + " op Spotify";
      frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen";
      cd.replaceWith(frame);
      var play = card.querySelector(".play");
      if (play) play.hidden = true;
      frame.focus();
    }
    card.querySelectorAll(".cd, .play").forEach(function (el) {
      el.addEventListener("click", load);
    });
  });

  // ---------- Video: uitgelichte video + afspeellijst, YouTube pas na een klik ----------
  var YT_ID = /^[A-Za-z0-9_-]{11}$/;
  var feat = document.getElementById("feat");
  var featBtn = document.getElementById("feat-btn");
  var featImg = document.getElementById("feat-img");
  var featTitle = document.getElementById("feat-title");
  var items = Array.prototype.slice.call(document.querySelectorAll("#playlist [data-yt]"));
  var current = items[0];

  function mark(item) {
    items.forEach(function (i) { i.classList.toggle("is-active", i === item); });
    current = item;
  }
  function play(item) {
    var id = item.getAttribute("data-yt");
    if (!YT_ID.test(id)) return;
    mark(item);
    var title = item.getAttribute("data-title") || "Video van Promilaasj";
    var frame = feat.querySelector("iframe");
    var fresh = !frame;
    if (fresh) {
      frame = document.createElement("iframe");
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    }
    frame.title = title;
    frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    if (fresh) {
      featBtn.replaceWith(frame);
      feat.classList.add("playing");
    }
    featTitle.textContent = title;
  }
  if (feat && featBtn && items.length) {
    featBtn.addEventListener("click", function () { play(current); });
    items.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        var img = item.querySelector("img");
        if (!feat.classList.contains("playing") && img) {
          // nog niet aan het afspelen: alleen de uitgelichte video wisselen
          featImg.src = img.getAttribute("src");
          featTitle.textContent = item.getAttribute("data-title");
          featBtn.setAttribute("aria-label", "Speel video af: " + item.getAttribute("data-title"));
          mark(item);
        }
        play(item);
      });
    });
  }

  // ---------- Agenda: alleen toekomstige optredens, oplopend op datum ----------
  var list = document.getElementById("gigs");
  var empty = document.getElementById("gigs-empty");
  var MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var DAYS = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  // Alleen echte https-links met een bestaande domeinnaam; een plaatshouder als "https://…" telt niet.
  function safeUrl(u) {
    return typeof u === "string" && /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]\S*)?$/i.test(u) ? u : "";
  }
  // Ook 2026-02-30 is geen datum.
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

  var gigs = (window.GIGS || [])
    .filter(function (g) { return g && g.title && g.date >= today && realDate(g.date); })
    .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

  if (list && gigs.length) {
    gigs.forEach(function (g) {
      var d = realDate(g.date);
      var li = el("li", "gig");

      var top = el("div", "top");
      top.append(el("div", "num", String(d.getDate())), el("span", "chip", DAYS[d.getDay()] + " · " + MONTHS[d.getMonth()]));

      var info = el("div");
      info.append(el("h3", "", g.title));
      var where = [g.venue, g.city].filter(Boolean).join(" · ");
      if (where) info.append(el("p", "", where));

      li.append(top, info);
      var url = safeUrl(g.url);
      if (url) {
        var a = el("a", "more-info");
        a.href = url;
        a.rel = "noopener";
        a.append(el("span", "", "Meer info"), el("span", "", "→"));
        li.append(a);
      }
      list.append(li);
    });
    list.hidden = false;
    empty.hidden = true;
  }

  // ---------- Links: op een laptop openen externe links in een nieuw tabblad ----------
  // Laptop = scherm vanaf 980 px breed met een muis. Op telefoon en tablet blijft alles in hetzelfde tabblad.
  // Links binnen de pagina (#...), mailto: en tel: blijven zoals ze zijn; de video's in de afspeellijst spelen in de pagina.
  var NEW_TAB_NOTE = " (opent in een nieuw tabblad)";
  var laptop = window.matchMedia("(min-width: 980px) and (hover: hover)");
  function setNewTab(on) {
    document.querySelectorAll('a[href^="https://"]:not([data-yt])').forEach(function (a) {
      var note = a.querySelector(".sr-note");
      if (on) {
        a.target = "_blank";
        if (!/\bnoopener\b/.test(a.rel)) a.rel = (a.rel + " noopener").trim();
        if (a.hasAttribute("aria-label")) {
          // alleen een icoon: de naam van de link krijgt de toelichting
          if (!a.hasAttribute("data-label")) a.setAttribute("data-label", a.getAttribute("aria-label"));
          a.setAttribute("aria-label", a.getAttribute("data-label") + NEW_TAB_NOTE);
        } else if (!note) {
          a.append(el("span", "sr-only sr-note", NEW_TAB_NOTE));
        }
      } else {
        a.removeAttribute("target");
        if (a.hasAttribute("data-label")) {
          a.setAttribute("aria-label", a.getAttribute("data-label"));
          a.removeAttribute("data-label");
        }
        if (note) note.remove();
      }
    });
  }
  setNewTab(laptop.matches);
  laptop.addEventListener("change", function (e) { setNewTab(e.matches); });

  // ---------- Teaservideo: niet autoplayen als de bezoeker minder beweging wil ----------
  var teaser = document.querySelector("video.cover");
  if (teaser && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    teaser.removeAttribute("autoplay");
    teaser.pause();
  }

  // ---------- Jaartal in de footer ----------
  var year = document.getElementById("year");
  if (year) year.textContent = String(now.getFullYear());
})();
