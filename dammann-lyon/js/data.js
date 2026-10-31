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

  return { FAMILIES: FAMILIES, PRODUCTS: PRODUCTS };
})();
