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
  var select = document.getElementById("atelierSelect");
  document.querySelectorAll("[data-atelier]").forEach(function (btn) {
    btn.addEventListener("click", function () { select.value = btn.getAttribute("data-atelier"); });
  });

  var form = document.getElementById("reserver");
  var msg = document.getElementById("bookingMsg");
  var dateInput = form.querySelector('input[type="date"]');
  dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll("input, select").forEach(function (field) {
      var valid = field.checkValidity();
      field.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      msg.textContent = "Merci de compléter tous les champs.";
      return;
    }
    var data = Object.fromEntries(new FormData(form));
    // À BRANCHER : envoyer `data` vers l'outil de réservation de la boutique
    // (e-mail, Calendly, formulaire Formspree, back-office…).
    console.info("Demande de réservation", data);
    msg.textContent = "Merci " + data.nom + " ! Votre demande pour « " + data.atelier + " » a bien été préparée.";
    form.reset();
  });

  /* ---------- Divers ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
