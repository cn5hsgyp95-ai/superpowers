# Dammann Frères Lyon — refonte « Noir Céleste »

Maquette de refonte de dammannfreres-lyon.fr : charte noir / or / crème, feuille de thé dorée en 3D (Three.js), cartes en verre inclinables, réservation d'ateliers.

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
├── js/scene.js       Scène 3D : feuille, vapeur, anneaux, réaction souris/défilement
├── js/main.js        Menu, apparitions, cartes 3D, formulaire
└── vendor/           Three.js r149 (licence MIT)
```

## À compléter avant mise en ligne

Ces éléments sont des **valeurs provisoires**, à remplacer par les vraies infos :

- [ ] Ateliers : noms, durées et tarifs (`XX min`, `XX €` dans `index.html`)
- [ ] Horaires des deux boutiques, téléphone de la boutique Frères Lumière, code postal
- [ ] Formulaire de réservation : il valide les champs mais **n'envoie rien**. Brancher l'envoi dans `js/main.js` (repère `À BRANCHER`) — ex. Formspree, Calendly ou l'outil de réservation existant
- [ ] Photos des boutiques et des thés si souhaité
- [ ] Mentions légales / politique de confidentialité (obligatoires en France)
- [ ] Validation de l'usage du nom et du logo par Dammann Frères

## Hébergement

Site 100 % statique : il suffit de déposer le dossier sur Netlify, Vercel, GitHub Pages ou l'hébergeur actuel.
