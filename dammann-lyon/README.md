# Dammann Frères Lyon — refonte « Noir Céleste »

Maquette de refonte de dammannfreres-lyon.fr : charte noir / or / crème, feuille de thé dorée en 3D (Three.js), cartes en verre inclinables, réservation d'ateliers.

**Objectif du site : orienter vers les 3 ateliers** (45 € chacun) et aider chaque visiteur à choisir le sien :
- *Une plante, 6 couleurs* · *Du nez à la tasse* · *La diversité du Japon* — chacun avec son voyage 3D ;
- un quiz en 4 questions qui recommande un atelier ;
- « Offrir un atelier » : carte cadeau à 45 €, c'est la personne qui reçoit qui choisit son thème ;
- réservation avec option « J'ai reçu un atelier en cadeau ».

Contenu des ateliers, prix et questions du quiz : `js/data.js` (`ATELIERS`, `ATELIER_PRICE`, `QUIZ`).

**Palette vivante** : la base reste noir et or ; chaque famille de thé apporte sa teinte (ambre, jade, miel, ivoire, rose, cuivre) qui colore la page au survol et tout le voyage.

**Le Voyage** : chaque famille et chaque référence ouvre une immersion 3D en 4 étapes pilotées par le défilement — Origine (jardins en terrasses), Ingrédients (le mélange flotte autour de vous), Infusion (théière en verre, l'eau prend la couleur du thé), La tasse (notes et suite du parcours).

## Lancer le site

**Option 1 (la plus simple) :** double-cliquer sur `index.html`. Tout fonctionne hors ligne (Three.js est inclus dans `vendor/`).

**Option 2 (serveur local, recommandé pour tester sur mobile) :**

```bash
cd dammann-lyon
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
dammann-lyon/
├── index.html        Contenu de toutes les sections
├── css/styles.css    Charte (couleurs en haut du fichier, variables --or, --noir…)
├── js/data.js        CATALOGUE : familles, références, ingrédients, couleurs
├── js/scene.js       Scène 3D d'accueil : feuille, vapeur, anneaux
├── js/voyage.js      Immersion 3D en 4 étapes pour chaque thé
├── js/main.js        Menu, apparitions, cartes 3D, formulaire
└── vendor/           Three.js r149 (licence MIT)
```

## Ajouter une référence

Ouvrir `js/data.js`, copier un bloc de `PRODUCTS`, changer le nom, la famille, les textes et les ingrédients. La carte et son voyage 3D sont générés automatiquement. Types d'ingrédients 3D disponibles : `leaf`, `pearl`, `bud`, `needle`, `strawberry`, `rhubarb`, `orange`, `lemon`, `bergamot`, `petal`, `berry`.

## À compléter avant mise en ligne

Ces éléments sont des **valeurs provisoires**, à remplacer par les vraies infos :

- [ ] **Catalogue complet** : seules 3 références signatures sont intégrées (Goût Russe Douchka, Jardin Bleu, Jardin du Trocadéro), d'après des sources publiques. Ajouter les autres dans `js/data.js`, avec les prix
- [ ] Ateliers : durée, jours et horaires, boutique où ils ont lieu, nombre de places
- [ ] Atelier 6 couleurs : « 15 tasses » vs « 3 tasses par couleur » (6 × 3 = 18) — confirmer le nombre de plateaux
- [ ] Carte cadeau : brancher le paiement et l'envoi (repère `À BRANCHER` dans `js/main.js`), définir la durée de validité
- [ ] Températures et temps d'infusion : ce sont des conseils généraux par famille, à aligner sur les fiches de la Maison
- [ ] Horaires des deux boutiques, téléphone de la boutique Frères Lumière, code postal
- [ ] Formulaire de réservation : il valide les champs mais **n'envoie rien**. Brancher l'envoi dans `js/main.js` (repère `À BRANCHER`) — ex. Formspree, Calendly ou l'outil de réservation existant
- [ ] Photos des boutiques et des thés si souhaité
- [ ] Mentions légales / politique de confidentialité (obligatoires en France)
- [ ] Validation de l'usage du nom et du logo par Dammann Frères

## Hébergement

Site 100 % statique : il suffit de déposer le dossier sur Netlify, Vercel, GitHub Pages ou l'hébergeur actuel.
