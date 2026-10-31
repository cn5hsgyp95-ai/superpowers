/* =========================================================
   Catalogue — familles de thé et références de la Maison
   ---------------------------------------------------------
   Pour ajouter une référence : copier un objet de PRODUCTS,
   changer les textes, choisir une famille et des ingrédients
   parmi les types disponibles :
     leaf, pearl, bud, needle, strawberry, rhubarb,
     orange, lemon, bergamot, petal, berry
   Chaque famille porte sa propre teinte (palette vivante).
   ========================================================= */
window.DAMMANN_DATA = (function () {
  "use strict";

  var FAMILIES = {
    noir: {
      id: "noir", name: "Thés noirs",
      accent: "#d8913f", liquor: "#8a3b12", sky: "#1b0d05", leaf: "#3b2615",
      tagline: "Corsés, maltés ou fumés : la profondeur des grands jardins.",
      origin: "Des jardins d'altitude aux grandes plaines, les feuilles sont entièrement oxydées : elles prennent leur couleur sombre et leurs notes profondes.",
      ingredients: [{ type: "leaf", label: "Feuilles de thé noir" }],
      temp: 95, time: "3 à 5 min",
      notes: ["Malté", "Boisé", "Profond"]
    },
    vert: {
      id: "vert", name: "Thés verts",
      accent: "#5fbf94", liquor: "#c4c36a", sky: "#06140f", leaf: "#4f7a35",
      tagline: "Fraîcheur végétale et notes iodées, de la Chine au Japon.",
      origin: "Cueillies puis chauffées très vite pour stopper l'oxydation, les feuilles gardent leur éclat végétal.",
      ingredients: [{ type: "leaf", label: "Feuilles de thé vert" }],
      temp: 75, time: "2 à 3 min",
      notes: ["Végétal", "Frais", "Iodé"]
    },
    oolong: {
      id: "oolong", name: "Oolongs",
      accent: "#e0a845", liquor: "#c27a2a", sky: "#140d04", leaf: "#5a5a2a",
      tagline: "Entre vert et noir, des arômes floraux et boisés.",
      origin: "Roulées en perles puis partiellement oxydées, les feuilles se déploient lentement au fil des infusions.",
      ingredients: [{ type: "pearl", label: "Perles roulées" }, { type: "leaf", label: "Feuilles déployées" }],
      temp: 95, time: "4 à 6 min",
      notes: ["Floral", "Miellé", "Boisé"]
    },
    blanc: {
      id: "blanc", name: "Thés blancs",
      accent: "#efe4c6", liquor: "#e3cf8e", sky: "#12110c", leaf: "#cfd2b8",
      tagline: "Délicats et précieux, à peine transformés.",
      origin: "Simplement flétris et séchés, les bourgeons duveteux conservent toute leur délicatesse.",
      ingredients: [{ type: "bud", label: "Bourgeons argentés" }],
      temp: 75, time: "3 à 5 min",
      notes: ["Doux", "Floral", "Soyeux"]
    },
    infusion: {
      id: "infusion", name: "Infusions",
      accent: "#e79ab0", liquor: "#b0405a", sky: "#17070f", leaf: "#7a3a4a",
      tagline: "Fleurs, fruits et plantes, sans théine.",
      origin: "Des fleurs, des fruits et des plantes, assemblés pour se savourer à toute heure, sans théine.",
      ingredients: [{ type: "petal", label: "Pétales", color: "#d9466e" }, { type: "berry", label: "Baies" }],
      temp: 100, time: "5 à 8 min",
      notes: ["Fruité", "Floral", "Sans théine"]
    },
    rooibos: {
      id: "rooibos", name: "Rooibos",
      accent: "#dd6f45", liquor: "#a8452a", sky: "#170805", leaf: "#a8452a",
      tagline: "Doux et gourmand, à savourer à toute heure.",
      origin: "Une plante d'Afrique du Sud aux fines aiguilles rouges, naturellement sans théine.",
      ingredients: [{ type: "needle", label: "Aiguilles de rooibos" }],
      temp: 100, time: "5 à 8 min",
      notes: ["Doux", "Gourmand", "Sans théine"]
    }
  };

  // Références signatures — informations issues de sources publiques
  // (dammann.fr, revendeurs). Prix : à compléter par la boutique.
  var PRODUCTS = [
    {
      id: "gout-russe-douchka",
      name: "Goût Russe Douchka",
      family: "noir",
      tagline: "Le thé aux agrumes qui a lancé la renaissance des thés parfumés.",
      origin: "Créé dans les années 1950 par Jean Jumeau-Lafond pour son épouse. Sa version actuelle associe trois thés de Chine.",
      ingredients: [
        { type: "leaf", label: "Thés noirs de Chine" },
        { type: "orange", label: "Orange" },
        { type: "lemon", label: "Citron" },
        { type: "bergamot", label: "Bergamote" }
      ],
      notes: ["Agrumes", "Bergamote", "Iconique"],
      price: null
    },
    {
      id: "jardin-bleu",
      name: "Jardin Bleu",
      family: "noir",
      tagline: "Un thé noir fruité, entre rhubarbe et fraise des bois.",
      origin: "Une promenade dans un jardin d'été : la rondeur du thé noir rencontre l'acidulé de la rhubarbe.",
      ingredients: [
        { type: "leaf", label: "Thé noir" },
        { type: "rhubarb", label: "Rhubarbe" },
        { type: "strawberry", label: "Fraise des bois" }
      ],
      notes: ["Fruité", "Acidulé", "Gourmand"],
      price: null
    },
    {
      id: "jardin-du-trocadero",
      name: "Jardin du Trocadéro",
      family: "vert",
      tagline: "Un thé vert fruité, créé pour la collection Tour Eiffel.",
      origin: "Un thé vert de Chine, imaginé pour la collection Dammann Frères × Tour Eiffel.",
      ingredients: [
        { type: "leaf", label: "Thé vert de Chine" },
        { type: "rhubarb", label: "Rhubarbe" },
        { type: "strawberry", label: "Fraise des bois & fraise" }
      ],
      notes: ["Frais", "Fruité", "Rhubarbe"],
      price: null
    }
  ];


  /* -------------------------------------------------------
     ATELIERS — contenu fourni par la boutique.
     Tous au même prix ; en cadeau, c'est la personne qui
     reçoit qui choisit son thème.
     ------------------------------------------------------- */
  var ATELIER_PRICE = 45;

  var ATELIERS = [
    {
      id: "six-couleurs",
      name: "Une plante, 6 couleurs",
      short: "Découvrez comment votre palais réagit à chaque couleur de thé, et repartez avec votre profil aromatique.",
      accent: "#e3b45a", liquor: "#b5762a", sky: "#120c05", leaf: "#6b5a2a",
      orbs: ["#efe4c6", "#e3cf6a", "#5fbf94", "#3f8f8a", "#b0402a", "#3a2416"],
      highlights: ["15 tasses", "6 couleurs", "Plateaux de 3 tasses", "Votre profil aromatique"],
      forWho: "Pour celles et ceux qui ne savent pas encore vraiment ce qu'ils aiment.",
      stepLabels: ["L'atelier", "6 couleurs", "Comparer", "Votre profil"],
      steps: [
        { title: "Une plante, 6 couleurs", lead: "Une seule plante, six couleurs de thé, quinze tasses.",
          text: "Toutes les couleurs du thé naissent de la même plante, le théier. Dans cet atelier, vous découvrez comment votre palais réagit à chacune d'elles." },
        { title: "Six couleurs à explorer",
          list: ["Blanc", "Jaune", "Vert", "Bleu-vert (oolong)", "Rouge (nos thés noirs)", "Noir (thés sombres)"] },
        { title: "Comparer, tasse après tasse",
          text: "Les tasses sont servies en plateaux de trois. À chaque plateau, vous comparez et vous tranchez : j'aime, je n'aime pas. Plus votre avis est franc, plus votre profil sera juste." },
        { title: "Votre profil aromatique",
          text: "À partir de vos retours sur les thés sélectionnés, nous dressons votre profil aromatique. Vous repartez en sachant quels thés vous ressemblent." }
      ],
      ingredients: [
        { type: "leaf", label: "Feuilles des 6 couleurs", colors: ["#efe4c6", "#d8c45a", "#5f9f4a", "#3f7f6a", "#8a3a1a", "#2e1d10"] },
        { type: "drop", label: "Liqueurs", colors: ["#efe0a8", "#e3cf6a", "#c4c36a", "#d9a441", "#a8452a", "#4a2410"] }
      ]
    },
    {
      id: "nez-tasse",
      name: "Du nez à la tasse",
      short: "Pourquoi le thé aromatisé senti en boutique n'a pas le même goût à la maison ? Comprenez l'écart, et choisissez mieux.",
      accent: "#e79ab0", liquor: "#b0405a", sky: "#17070f", leaf: "#7a3a4a",
      orbs: ["#f08a24", "#a9c43c", "#e79ab0", "#6e0f2c"],
      highlights: ["Aromatisation", "Assemblage", "Thés parfumés", "Bien choisir"],
      forWho: "Pour les amateurs de thés et d'infusions aromatisés, parfois déçus une fois chez eux.",
      stepLabels: ["L'atelier", "Les arômes", "L'écart", "Bien choisir"],
      steps: [
        { title: "Du nez à la tasse", lead: "Vous sentez un thé, vous craquez… et à la maison, ce n'est plus tout à fait pareil.",
          text: "Entre ce que l'on sent et ce que l'on boit, il y a souvent un écart. Cet atelier vous explique d'où il vient." },
        { title: "Tout sur l'aromatisation",
          list: ["L'aromatisation", "L'assemblage", "Les thés parfumés", "Thés et infusions aromatisés"] },
        { title: "Comprendre l'écart",
          text: "Pourquoi le nez et la tasse ne racontent-ils pas toujours la même histoire ? Nous le décryptons ensemble, tasses à l'appui." },
        { title: "Choisir sans se tromper",
          text: "Vous repartez avec les clés pour choisir le thé ou la tisane aromatisée qui vous plaira vraiment, chez vous aussi." }
      ],
      ingredients: [
        { type: "orange", label: "Agrumes" },
        { type: "bergamot", label: "Bergamote" },
        { type: "petal", label: "Pétales", color: "#e79ab0" },
        { type: "berry", label: "Fruits rouges" },
        { type: "leaf", label: "Thé" }
      ]
    },
    {
      id: "japon",
      name: "La diversité du Japon",
      short: "Ce que le Japon a apporté au thé : thés verts, thés noirs fumés, matcha, et des accords avec fromage et chocolat.",
      accent: "#9cc65a", liquor: "#9fb84a", sky: "#07120a", leaf: "#4f8a35",
      orbs: ["#9cc65a", "#4f8a35", "#3a2416", "#c0392b"],
      highlights: ["Thés japonais", "Thés noirs fumés", "Matcha", "Fromage & chocolat"],
      forWho: "Pour les curieux de culture, de savoir-faire et d'accords inattendus.",
      stepLabels: ["L'atelier", "Les tasses", "Matcha", "Accords"],
      steps: [
        { title: "La diversité du Japon", lead: "Ce que le Japon a apporté au thé.",
          text: "Une dimension spirituelle, et un savoir-faire unique : la manufacture de la feuille, le bouturage des théiers, expliqués en détail." },
        { title: "Dans vos tasses",
          list: ["Thés japonais, dominante thé vert", "Thés noirs fumés", "Un épisode matcha", "Accords fromage & chocolat"] },
        { title: "L'épisode matcha",
          text: "Un moment dédié au matcha, pour comprendre la dimension spirituelle que le Japon a donnée au thé." },
        { title: "Des accords inattendus",
          text: "Thé et fromage, thé et chocolat : des associations qui font découvrir le thé autrement." }
      ],
      ingredients: [
        { type: "leaf", label: "Thés verts japonais", colors: ["#5f9f4a", "#4f8a35", "#7cb342"] },
        { type: "matcha", label: "Matcha" },
        { type: "leaf", label: "Thés noirs fumés", colors: ["#2e1d10", "#3b2615"] },
        { type: "cheese", label: "Fromage" },
        { type: "chocolate", label: "Chocolat" }
      ]
    }
  ];

  /* Quiz « Quel atelier pour vous ? » : chaque réponse donne un point à un atelier */
  var QUIZ = [
    { q: "Quand vous choisissez un thé, vous…",
      a: [["Ne savez jamais vraiment ce que vous aimez", "six-couleurs"],
          ["Craquez pour un parfum… puis êtes un peu déçu à la maison", "nez-tasse"],
          ["Cherchez des thés d'exception, avec une histoire", "japon"]] },
    { q: "Ce qui vous ferait le plus plaisir :",
      a: [["Repartir avec mon profil aromatique", "six-couleurs"],
          ["Percer les secrets de l'aromatisation et de l'assemblage", "nez-tasse"],
          ["Découvrir le matcha et des accords fromage & chocolat", "japon"]] },
    { q: "Votre tasse idéale est plutôt…",
      a: [["Je ne sais pas encore, c'est justement la question !", "six-couleurs"],
          ["Fruitée, fleurie, gourmande", "nez-tasse"],
          ["Végétale, intense, ou fumée", "japon"]] },
    { q: "Vous êtes plutôt…",
      a: [["Curieux, j'aime comparer et me tester", "six-couleurs"],
          ["Sensible aux parfums et aux odeurs", "nez-tasse"],
          ["Passionné de culture et de voyages", "japon"]] }
  ];

  return { FAMILIES: FAMILIES, PRODUCTS: PRODUCTS, ATELIERS: ATELIERS, ATELIER_PRICE: ATELIER_PRICE, QUIZ: QUIZ };
})();
