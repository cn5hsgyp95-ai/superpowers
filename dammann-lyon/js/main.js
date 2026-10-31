/* =========================================================
   Interactions de l'interface
   ========================================================= */
(function () {
  "use strict";

  var body = document.body;
  body.classList.add("is-loading");

  /* ---------- Loader ---------- */
  function hideLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("is-done");
    body.classList.remove("is-loading");
  }
  window.addEventListener("load", function () { setTimeout(hideLoader, 500); });
  setTimeout(hideLoader, 4000); // filet de sécurité

  /* ---------- Navigation ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Catalogue (généré depuis js/data.js) ---------- */
  var DATA = window.DAMMANN_DATA;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  if (DATA) {
    var famEl = document.getElementById("familyCards");
    famEl.innerHTML = Object.keys(DATA.FAMILIES).map(function (k) {
      var f = DATA.FAMILIES[k];
      return '<button type="button" class="tea tilt reveal" data-voyage="family:' + f.id + '" data-accent="' + f.accent + '" style="--hue:' + f.liquor + ';--accent:' + f.accent + '">' +
        '<span class="tea__orb"></span>' +
        '<span class="tea__name">' + esc(f.name) + '</span>' +
        '<span class="tea__text">' + esc(f.tagline) + '</span>' +
        '<span class="tea__go">Entrer dans le voyage <i aria-hidden="true">→</i></span>' +
      '</button>';
    }).join("");

    var prodEl = document.getElementById("productCards");
    prodEl.innerHTML = DATA.PRODUCTS.map(function (p, i) {
      var f = DATA.FAMILIES[p.family];
      var chips = p.ingredients.map(function (g) { return "<li>" + esc(g.label) + "</li>"; }).join("");
      return '<article class="product glass tilt reveal" data-accent="' + f.accent + '" style="--accent:' + f.accent + ';--liquor:' + f.liquor + '">' +
        '<div class="product__visual" aria-hidden="true"><span class="product__cup"></span><span class="product__ring"></span><span class="product__num">0' + (i + 1) + '</span></div>' +
        '<div class="product__body">' +
          '<p class="product__family">' + esc(f.name) + '</p>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + esc(p.tagline) + '</p>' +
          '<ul class="product__chips">' + chips + '</ul>' +
          '<button type="button" class="btn btn--gold btn--sm" data-voyage="product:' + p.id + '">Vivre l\'immersion</button>' +
        '</div>' +
      '</article>';
    }).join("");

    // Palette vivante : la scène et la page prennent la couleur du thé survolé
    document.querySelectorAll("[data-accent]").forEach(function (el) {
      el.addEventListener("pointerenter", function () {
        var c = el.getAttribute("data-accent");
        document.documentElement.style.setProperty("--live", c);
        if (window.DammannScene) window.DammannScene.setAccent(c);
      });
      el.addEventListener("pointerleave", function () {
        document.documentElement.style.removeProperty("--live");
        if (window.DammannScene) window.DammannScene.setAccent(null);
      });
    });
  }

  /* ---------- Apparition au défilement ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Cartes inclinables en 3D ---------- */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", (x - 0.5) * 14 + "deg");
        card.style.setProperty("--rx", (0.5 - y) * 12 + "deg");
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Réservation ---------- */
  var form = document.getElementById("reserver");
  var msg = document.getElementById("bookingMsg");
  var dateInput = form.querySelector('input[type="date"]');
  var creneau = document.getElementById("creneauSelect");
  dateInput.min = new Date().toISOString().split("T")[0];

  function checkDay() {
    // La date doit tomber le jour du créneau choisi (lundi ou jeudi)
    dateInput.setCustomValidity("");
    if (!dateInput.value || !creneau.value) return;
    var day = new Date(dateInput.value + "T12:00:00").getDay();
    if (String(day) !== creneau.value) {
      dateInput.setCustomValidity(creneau.value === "1" ? "Choisissez un lundi." : "Choisissez un jeudi.");
    }
  }
  dateInput.addEventListener("change", checkDay);
  creneau.addEventListener("change", checkDay);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    checkDay();
    var ok = true, firstMsg = "";
    form.querySelectorAll("input, select").forEach(function (field) {
      var valid = field.checkValidity();
      field.classList.toggle("is-invalid", !valid);
      if (!valid) { ok = false; if (!firstMsg && field.validationMessage && field === dateInput) firstMsg = field.validationMessage; }
    });
    if (!ok) {
      msg.textContent = firstMsg || "Merci de compléter tous les champs.";
      return;
    }
    var data = Object.fromEntries(new FormData(form));
    // À BRANCHER : envoyer `data` vers l'outil de réservation de la boutique
    // (e-mail, Calendly, Formspree, back-office…). Rien n'est envoyé pour l'instant.
    console.info("Demande de réservation", data);
    msg.textContent = "Merci " + data.nom + " ! Votre demande est prête. (Envoi à connecter par la boutique.)";
    form.reset();
  });

  /* ---------- Divers ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
