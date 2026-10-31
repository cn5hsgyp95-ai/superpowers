/* =========================================================
   Interactions de l'interface
   ========================================================= */
(function () {
  "use strict";

  var body = document.body;
  var DATA = window.DAMMANN_DATA;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  body.classList.add("is-loading");

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(sel) { return document.querySelector(sel); }
  function goTo(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }

  /* ---------- Loader ---------- */
  function hideLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("is-done");
    body.classList.remove("is-loading");
  }
  window.addEventListener("load", function () { setTimeout(hideLoader, 500); });
  setTimeout(hideLoader, 4000);

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
  document.querySelectorAll("#navLinks a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  if (!DATA) return;
  var PRICE = DATA.ATELIER_PRICE;
  document.querySelectorAll("[data-price]").forEach(function (el) { el.textContent = PRICE; });

  /* ---------- Les 3 ateliers ---------- */
  var atelierById = {};
  DATA.ATELIERS.forEach(function (a) { atelierById[a.id] = a; });

  $("#atelierCards").innerHTML = DATA.ATELIERS.map(function (a, i) {
    var orbs = a.orbs.map(function (c, k) {
      return '<span style="--c:' + c + ";--i:" + k + ";--n:" + a.orbs.length + '"></span>';
    }).join("");
    return '<article class="atelier-card glass tilt reveal" id="atelier-' + a.id + '" data-accent="' + a.accent + '" style="--accent:' + a.accent + ";--liquor:" + a.liquor + '">' +
      '<div class="atelier-card__visual" aria-hidden="true"><div class="orbit">' + orbs + '</div><span class="atelier-card__num">0' + (i + 1) + "</span></div>" +
      '<div class="atelier-card__body">' +
        "<h3>" + esc(a.name) + "</h3>" +
        '<p class="atelier-card__short">' + esc(a.short) + "</p>" +
        '<ul class="product__chips">' + a.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
        '<p class="atelier-card__who">' + esc(a.forWho) + "</p>" +
        '<div class="atelier-card__cta">' +
          '<button type="button" class="btn btn--gold btn--sm" data-voyage="atelier:' + a.id + '">Vivre l\'atelier en 3D</button>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-pick="' + a.id + '">Réserver · ' + PRICE + " €</button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }).join("");

  /* ---------- Familles & références ---------- */
  $("#familyCards").innerHTML = Object.keys(DATA.FAMILIES).map(function (k) {
    var f = DATA.FAMILIES[k];
    return '<button type="button" class="tea tilt reveal" data-voyage="family:' + f.id + '" data-accent="' + f.accent + '" style="--hue:' + f.liquor + ";--accent:" + f.accent + '">' +
      '<span class="tea__orb"></span>' +
      '<span class="tea__name">' + esc(f.name) + "</span>" +
      '<span class="tea__text">' + esc(f.tagline) + "</span>" +
      '<span class="tea__go">Entrer dans le voyage <i aria-hidden="true">→</i></span>' +
    "</button>";
  }).join("");

  $("#productCards").innerHTML = DATA.PRODUCTS.map(function (p, i) {
    var f = DATA.FAMILIES[p.family];
    return '<article class="product glass tilt reveal" data-accent="' + f.accent + '" style="--accent:' + f.accent + ";--liquor:" + f.liquor + '">' +
      '<div class="product__visual" aria-hidden="true"><span class="product__cup"></span><span class="product__ring"></span><span class="product__num">0' + (i + 1) + "</span></div>" +
      '<div class="product__body">' +
        '<p class="product__family">' + esc(f.name) + "</p>" +
        "<h3>" + esc(p.name) + "</h3>" +
        "<p>" + esc(p.tagline) + "</p>" +
        '<ul class="product__chips">' + p.ingredients.map(function (g) { return "<li>" + esc(g.label) + "</li>"; }).join("") + "</ul>" +
        '<button type="button" class="btn btn--ghost btn--sm" data-voyage="product:' + p.id + '">Vivre l\'immersion</button>' +
      "</div>" +
    "</article>";
  }).join("");

  /* ---------- Palette vivante ---------- */
  function bindAccent(root) {
    root.querySelectorAll("[data-accent]").forEach(function (el) {
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
  bindAccent(document);

  /* ---------- Réservation ---------- */
  var select = $("#atelierSelect");
  DATA.ATELIERS.forEach(function (a) {
    var o = document.createElement("option");
    o.value = a.id; o.textContent = a.name;
    select.appendChild(o);
  });
  var undecided = document.createElement("option");
  undecided.value = "a-choisir"; undecided.textContent = "Je ne sais pas encore";
  select.appendChild(undecided);

  function pickAtelier(id) {
    select.value = id;
    select.classList.remove("is-invalid");
    goTo("#reserver");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]");
    if (!b || b.closest(".voyage")) return; // le voyage gère ses propres boutons
    e.preventDefault();
    pickAtelier(b.getAttribute("data-pick"));
  });
  document.addEventListener("atelier:pick", function (e) { select.value = e.detail; });

  var giftCheck = $("#giftCheck"), giftCodeField = $("#giftCodeField"), giftCode = $("#giftCode");
  giftCheck.addEventListener("change", function () {
    giftCodeField.hidden = !giftCheck.checked;
    giftCode.required = giftCheck.checked;
    if (giftCheck.checked) giftCode.focus();
  });

  function validate(form, msgEl) {
    var ok = true;
    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      if (f.closest("[hidden]")) return;
      var v = f.checkValidity();
      f.classList.toggle("is-invalid", !v);
      if (!v) ok = false;
    });
    if (!ok) msgEl.textContent = "Merci de compléter les champs indiqués.";
    return ok;
  }

  var form = $("#reserver"), msg = $("#bookingMsg");
  form.querySelector('input[type="date"]').min = new Date().toISOString().split("T")[0];
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(form, msg)) return;
    var data = Object.fromEntries(new FormData(form));
    // À BRANCHER : envoyer `data` à la boutique (e-mail, Calendly, Formspree…). Rien n'est envoyé pour l'instant.
    console.info("Demande de réservation", data);
    var name = atelierById[data.atelier] ? "« " + atelierById[data.atelier].name + " »" : "un atelier";
    msg.textContent = "Merci " + data.nom + " ! Votre demande pour " + name + " est prête. La boutique vous recontactera pour confirmer la date.";
    form.reset();
    giftCodeField.hidden = true;
  });

  /* ---------- Quiz ---------- */
  var quizBody = $("#quizBody"), quizBar = $("#quizBar");
  var answers = [];

  function showQuestion(i) {
    var q = DATA.QUIZ[i];
    quizBar.style.transform = "scaleX(" + (i / DATA.QUIZ.length) + ")";
    quizBody.innerHTML =
      '<p class="quiz__count">Question ' + (i + 1) + " / " + DATA.QUIZ.length + "</p>" +
      '<h3 class="quiz__q">' + esc(q.q) + "</h3>" +
      '<div class="quiz__answers">' + q.a.map(function (a, k) {
        return '<button type="button" class="quiz__answer" data-k="' + k + '"><span class="quiz__letter">' + "ABC"[k] + "</span>" + esc(a[0]) + "</button>";
      }).join("") + "</div>" +
      (i > 0 ? '<button type="button" class="quiz__back">← Question précédente</button>' : "");
    quizBody.classList.remove("is-in"); void quizBody.offsetWidth; quizBody.classList.add("is-in");
    quizBody.querySelectorAll(".quiz__answer").forEach(function (btn) {
      btn.addEventListener("click", function () {
        answers[i] = q.a[+btn.getAttribute("data-k")][1];
        if (i + 1 < DATA.QUIZ.length) showQuestion(i + 1); else showResult();
      });
    });
    var back = quizBody.querySelector(".quiz__back");
    if (back) back.addEventListener("click", function () { showQuestion(i - 1); });
  }

  function showResult() {
    var score = {};
    answers.forEach(function (id) { score[id] = (score[id] || 0) + 1; });
    // Égalité : la réponse à la question 2 (l'envie principale) départage
    var best = DATA.ATELIERS.map(function (a) { return a.id; }).sort(function (x, y) {
      var d = (score[y] || 0) - (score[x] || 0);
      if (d) return d;
      return (answers[1] === y) - (answers[1] === x);
    })[0];
    var a = atelierById[best];
    quizBar.style.transform = "scaleX(1)";
    quizBody.innerHTML =
      '<div class="quiz__result" style="--accent:' + a.accent + '">' +
        '<p class="quiz__count">Votre atelier</p>' +
        '<h3 class="quiz__q">' + esc(a.name) + "</h3>" +
        "<p>" + esc(a.short) + "</p>" +
        '<p class="atelier-card__who">' + esc(a.forWho) + "</p>" +
        '<div class="atelier-card__cta">' +
          '<button type="button" class="btn btn--gold" data-pick="' + a.id + '">Réserver cet atelier · ' + PRICE + " €</button>" +
          '<button type="button" class="btn btn--ghost" data-voyage="atelier:' + a.id + '">Le vivre en 3D</button>' +
        "</div>" +
        '<button type="button" class="quiz__back" id="quizRestart">↺ Recommencer</button>' +
      "</div>";
    quizBody.classList.remove("is-in"); void quizBody.offsetWidth; quizBody.classList.add("is-in");
    document.documentElement.style.setProperty("--live", a.accent);
    if (window.DammannScene) window.DammannScene.setAccent(a.accent);
    $("#quizRestart").addEventListener("click", function () { answers = []; showQuestion(0); });
  }
  showQuestion(0);

  /* ---------- Carte cadeau ---------- */
  var giftForm = $("#giftForm"), giftMsg = $("#giftMsg");
  var giftName = $("#giftName"), giftQty = $("#giftQty"), giftTotal = $("#giftTotal");
  var cardName = $("#giftCardName"), giftCard = $("#giftCard");
  function updateGift() {
    cardName.textContent = giftName.value.trim() || "vous";
    var q = Math.max(1, Math.min(10, parseInt(giftQty.value, 10) || 1));
    giftTotal.textContent = q * PRICE + " €" + (q > 1 ? " (" + q + " ateliers)" : "");
  }
  giftName.addEventListener("input", updateGift);
  giftQty.addEventListener("input", updateGift);
  updateGift();

  if (!reduceMotion) {
    var wrap = giftCard.parentElement;
    wrap.addEventListener("pointermove", function (e) {
      var r = wrap.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      giftCard.style.transform = "rotateY(" + x * 30 + "deg) rotateX(" + -y * 24 + "deg)";
      giftCard.style.setProperty("--sx", (x + 0.5) * 100 + "%");
    });
    wrap.addEventListener("pointerleave", function () { giftCard.style.transform = ""; });
  }

  giftForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate(giftForm, giftMsg)) return;
    var data = Object.fromEntries(new FormData(giftForm));
    // À BRANCHER : paiement et envoi de la carte cadeau (boutique en ligne, Stripe, SumUp…). Rien n'est envoyé ni encaissé.
    console.info("Commande carte cadeau", data);
    giftMsg.textContent = "Merci ! La carte cadeau pour " + data.beneficiaire + " est prête à être commandée. (Paiement à connecter par la boutique.)";
    giftForm.reset();
    updateGift();
  });

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
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", (x - 0.5) * 10 + "deg");
        card.style.setProperty("--rx", (0.5 - y) * 8 + "deg");
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

  document.getElementById("year").textContent = new Date().getFullYear();
})();
