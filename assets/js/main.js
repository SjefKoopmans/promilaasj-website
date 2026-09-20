(function () {
  "use strict";

  // Mobiel menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  // Spotify: het frame wordt pas geladen na een klik (sneller, minder tracking)
  var ID = /^[A-Za-z0-9]{10,30}$/;
  document.querySelectorAll("[data-spotify]").forEach(function (card) {
    var id = card.getAttribute("data-spotify");
    var cover = card.querySelector(".play-cover");
    if (!ID.test(id) || !cover) return;
    cover.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = "https://open.spotify.com/embed/album/" + id;
      frame.title = card.querySelector("h3").textContent + " op Spotify";
      frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen";
      cover.replaceWith(frame);
      frame.focus();
    });
  });

  // YouTube: idem, via youtube-nocookie
  var YT = /^[A-Za-z0-9_-]{11}$/;
  document.querySelectorAll("[data-yt]").forEach(function (card) {
    var id = card.getAttribute("data-yt");
    if (!YT.test(id)) return;
    var thumb = card.querySelector(".thumb");
    if (!thumb) return;
    thumb.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      frame.title = card.getAttribute("data-title") || "Video van Promilaasj";
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      thumb.replaceWith(frame);
      frame.focus();
    });
  });

  // Agenda: alleen toekomstige optredens, oplopend op datum
  var list = document.getElementById("gigs");
  var empty = document.getElementById("gigs-empty");
  var MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  var gigs = (window.GIGS || [])
    .filter(function (g) { return g && /^\d{4}-\d{2}-\d{2}$/.test(g.date) && g.title && g.date >= today; })
    .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

  if (gigs.length) {
    gigs.forEach(function (g) {
      var li = document.createElement("li");
      li.className = "gig";

      var date = document.createElement("div");
      date.className = "gig-date";
      var day = document.createElement("b");
      day.textContent = String(parseInt(g.date.slice(8, 10), 10));
      var month = document.createElement("span");
      month.textContent = MONTHS[parseInt(g.date.slice(5, 7), 10) - 1] || "";
      date.append(day, month);

      var info = document.createElement("div");
      var title = document.createElement("h3");
      title.textContent = g.title;
      info.append(title);
      var where = [g.venue, g.city].filter(Boolean).join(", ");
      if (where) {
        var p = document.createElement("p");
        p.textContent = where;
        info.append(p);
      }
      if (g.url && /^https:\/\//.test(g.url)) {
        var a = document.createElement("a");
        a.href = g.url;
        a.rel = "noopener";
        a.textContent = "Meer info";
        info.append(a);
      }

      li.append(date, info);
      list.append(li);
    });
    list.hidden = false;
    empty.hidden = true;
  }

  // Jaartal in de footer
  var year = document.getElementById("year");
  if (year) year.textContent = String(now.getFullYear());
})();
