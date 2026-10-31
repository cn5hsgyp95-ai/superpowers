/* =========================================================
   Le Voyage — immersion 3D pour chaque thé
   4 étapes pilotées par le défilement :
     1. Origine     — survol de jardins en terrasses dans la brume
     2. Ingrédients — les composants du mélange flottent autour de vous
     3. Infusion    — les feuilles se déploient, l'eau prend sa couleur
     4. La tasse    — notes, conseils, et suite du parcours
   ========================================================= */
(function () {
  "use strict";

  var DATA = window.DAMMANN_DATA;
  var overlay = document.getElementById("voyage");
  if (!overlay || !DATA) return;

  var canvas = overlay.querySelector(".voyage__canvas");
  var stepsEl = overlay.querySelector(".voyage__steps");
  var progressBar = overlay.querySelector(".voyage__progress span");
  var stepDots = overlay.querySelectorAll(".voyage__nav li");
  var closeBtn = overlay.querySelector(".voyage__close");
  var hasGL = !!window.THREE && !document.documentElement.classList.contains("no-webgl");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilitaires ---------- */
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  function smooth(a, b, v) { var t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* =======================================================
     Scène 3D (créée une seule fois, à la première ouverture)
     ======================================================= */
  var R = null; // contexte 3D

  function buildScene() {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0c);
    scene.fog = new THREE.FogExp2(0x0b0b0c, 0.03);

    var camera = new THREE.PerspectiveCamera(50, 1, 0.05, 400);

    // Environnement pour les reflets (verre, porcelaine, or)
    var env = new THREE.Scene();
    env.background = new THREE.Color(0x101010);
    [[0xfff2dc, [0, 6, 0], [Math.PI / 2, 0, 0], [8, 3]],
     [0xc9a45c, [-6, 0, 0], [0, Math.PI / 2, 0], [3, 6]],
     [0x6a8a80, [6, 0, 0], [0, -Math.PI / 2, 0], [3, 6]]].forEach(function (p) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(p[3][0], p[3][1]), new THREE.MeshBasicMaterial({ color: p[0], side: THREE.DoubleSide }));
      m.position.fromArray(p[1]); m.rotation.fromArray(p[2]); env.add(m);
    });
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();

    var hemi = new THREE.HemisphereLight(0xfff0d8, 0x1a1208, 0.7);
    scene.add(hemi);
    var sunLight = new THREE.DirectionalLight(0xffe0b0, 1.6);
    sunLight.position.set(-20, 18, -30);
    scene.add(sunLight);
    var accentLight = new THREE.PointLight(0xffffff, 2.2, 30);
    scene.add(accentLight);

    var dot = (function () {
      var c = document.createElement("canvas"); c.width = c.height = 64;
      var g = c.getContext("2d");
      var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.4, "rgba(255,255,255,.35)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    /* ---------- Étape 1 : jardins en terrasses ---------- */
    var terrainGeo = new THREE.PlaneGeometry(120, 120, 180, 180);
    terrainGeo.rotateX(-Math.PI / 2);
    var tp = terrainGeo.attributes.position;
    var tcol = new Float32Array(tp.count * 3);
    var cLow = new THREE.Color(0x173222), cHigh = new THREE.Color(0x5d8a4a), cRow = new THREE.Color(0x86ad5e);
    var tmp = new THREE.Color();
    for (var i = 0; i < tp.count; i++) {
      var x = tp.getX(i), z = tp.getZ(i);
      var h = 3.2 * Math.sin(x * 0.09) + 2.6 * Math.cos(z * 0.08) + 1.4 * Math.sin((x + z) * 0.17) + 0.04 * Math.abs(x) * 0.6;
      var valley = Math.exp(-(x * x) / 60) * 3.5; // vallée centrale pour le survol
      h -= valley;
      var step = 0.75;
      var terr = Math.floor(h / step) * step;
      var frac = (h - terr) / step;
      var y = terr + Math.pow(frac, 6) * step; // marches nettes = terrasses
      tp.setY(i, y);
      tmp.copy(cLow).lerp(cHigh, clamp01((y + 4) / 10));
      if (frac < 0.25) tmp.lerp(cRow, 0.55); // rangées de théiers au bord des terrasses
      tcol[i * 3] = tmp.r; tcol[i * 3 + 1] = tmp.g; tcol[i * 3 + 2] = tmp.b;
    }
    terrainGeo.setAttribute("color", new THREE.BufferAttribute(tcol, 3));
    terrainGeo.computeVertexNormals();
    var terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
    terrain.position.y = -2;
    scene.add(terrain);

    // Soleil levant
    var sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffd9a0, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    sun.scale.set(40, 40, 1);
    sun.position.set(0, 10, -70);
    scene.add(sun);

    // Brume
    var MIST = 900;
    var mistGeo = new THREE.BufferGeometry();
    var mp = new Float32Array(MIST * 3);
    for (var m = 0; m < MIST; m++) { mp[m * 3] = rand(-50, 50); mp[m * 3 + 1] = rand(-1, 4); mp[m * 3 + 2] = rand(-55, 30); }
    mistGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
    var mist = new THREE.Points(mistGeo, new THREE.PointsMaterial({ size: 3.2, map: dot, color: 0xe8e0d0, transparent: true, opacity: 0.16, depthWrite: false }));
    scene.add(mist);

    /* ---------- Étape 2 : nuage d'ingrédients ---------- */
    var ING_CENTER = new THREE.Vector3(0, 32, 0);
    var ingGroup = new THREE.Group();
    ingGroup.position.copy(ING_CENTER);
    scene.add(ingGroup);

    var stars = (function () {
      var N = 1200, g = new THREE.BufferGeometry(), p = new Float32Array(N * 3);
      for (var s = 0; s < N; s++) {
        var r = rand(25, 90), th = rand(0, Math.PI * 2), ph = Math.acos(rand(-1, 1));
        p[s * 3] = r * Math.sin(ph) * Math.cos(th); p[s * 3 + 1] = 40 + r * Math.cos(ph); p[s * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      var pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.35, map: dot, color: 0xe8d3a3, transparent: true, opacity: 0.7, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      scene.add(pts);
      return pts;
    })();

    /* ---------- Étapes 3 & 4 : théière, tasse ---------- */
    var TEA_CENTER = new THREE.Vector3(0, 62, 0);
    var teaGroup = new THREE.Group();
    teaGroup.position.copy(TEA_CENTER);
    scene.add(teaGroup);

    // Plateau
    var tray = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.12, 96),
      new THREE.MeshStandardMaterial({ color: 0x070504, metalness: 0.2, roughness: 0.8, envMapIntensity: 0.25 }));
    tray.position.y = -1.56;
    teaGroup.add(tray);
    var trayRim = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.03, 8, 160), new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.25 }));
    trayRim.rotation.x = Math.PI / 2; trayRim.position.y = -1.5;
    teaGroup.add(trayRim);

    // Théière en verre (profil tourné)
    var potProfile = [];
    for (var a = 0; a <= 24; a++) {
      var tt = a / 24;
      var yy = -1.5 + tt * 2.6;
      var rr = 0.15 + Math.sin(Math.min(1, tt * 1.15) * Math.PI) * 1.35 + (tt > 0.9 ? -0.2 : 0);
      if (a === 0) rr = 0.9;
      potProfile.push(new THREE.Vector2(Math.max(0.05, rr), yy));
    }
    potProfile.push(new THREE.Vector2(0.55, 1.15));
    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.4,
      transparent: true, opacity: 0.35, side: THREE.DoubleSide, envMapIntensity: 1.4, clearcoat: 1
    });
    var pot = new THREE.Mesh(new THREE.LatheGeometry(potProfile, 72), glassMat);
    pot.position.x = -1.3;
    teaGroup.add(pot);
    var lid = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.2 }));
    lid.position.set(-1.3, 1.35, 0);
    teaGroup.add(lid);
    var spout = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.1, -0.6, 0), new THREE.Vector3(1.7, -0.2, 0), new THREE.Vector3(2.0, 0.55, 0)]), 24, 0.12, 12), glassMat);
    spout.position.x = -1.3;
    teaGroup.add(spout);
    var handle = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 12, 48, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.25 }));
    handle.position.set(-2.75, -0.1, 0);
    handle.rotation.z = Math.PI * 0.4;
    teaGroup.add(handle);

    // Liquide dans la théière
    var liqProfile = [];
    for (var l = 0; l <= 16; l++) {
      var lt = l / 16, ly = -1.45 + lt * 1.9;
      var lr = (0.15 + Math.sin(Math.min(1, ((ly + 1.5) / 2.6) * 1.15) * Math.PI) * 1.35) - 0.07;
      liqProfile.push(new THREE.Vector2(Math.max(0.05, lr), ly));
    }
    liqProfile.push(new THREE.Vector2(0.001, 0.45));
    var liquidMat = new THREE.MeshPhysicalMaterial({ color: 0xcfe6ee, roughness: 0.1, transparent: true, opacity: 0.35, transmission: 0.2, depthWrite: false });
    var liquid = new THREE.Mesh(new THREE.LatheGeometry(liqProfile, 64), liquidMat);
    liquid.position.x = -1.3;
    liquid.renderOrder = -1;
    teaGroup.add(liquid);

    // Feuilles qui infusent
    var leafShape = new THREE.Shape();
    leafShape.moveTo(0, -0.5);
    leafShape.bezierCurveTo(0.3, -0.3, 0.32, 0.25, 0, 0.55);
    leafShape.bezierCurveTo(-0.32, 0.25, -0.3, -0.3, 0, -0.5);
    var smallLeafGeo = new THREE.ShapeGeometry(leafShape, 12);
    (function bend(g) { var p = g.attributes.position; for (var b = 0; b < p.count; b++) { var bx = p.getX(b); p.setZ(b, bx * bx * 0.8); } g.computeVertexNormals(); })(smallLeafGeo);
    var steepLeafMat = new THREE.MeshStandardMaterial({ color: 0x3b2615, roughness: 0.7, side: THREE.DoubleSide });
    var steepLeaves = [];
    for (var sl = 0; sl < 14; sl++) {
      var lf = new THREE.Mesh(smallLeafGeo, steepLeafMat);
      lf.userData = { a: rand(0, Math.PI * 2), r: rand(0.1, 0.9), y0: rand(-1.3, 0.2), sp: rand(0.3, 0.8), spin: rand(-1, 1) };
      lf.position.x = -1.3;
      teaGroup.add(lf);
      steepLeaves.push(lf);
    }

    // Tasse en porcelaine avec filet d'or
    var cupProfile = [
      new THREE.Vector2(0.001, -1.5), new THREE.Vector2(0.45, -1.5), new THREE.Vector2(0.5, -1.42),
      new THREE.Vector2(0.62, -1.32), new THREE.Vector2(0.95, -1.05), new THREE.Vector2(1.12, -0.7),
      new THREE.Vector2(1.18, -0.45), new THREE.Vector2(1.13, -0.45), new THREE.Vector2(1.07, -0.7),
      new THREE.Vector2(0.9, -1.0), new THREE.Vector2(0.58, -1.27), new THREE.Vector2(0.001, -1.3)
    ];
    var porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf6f1e7, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
    var cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 96), porcelain);
    cup.position.set(2.2, 0, 0.6);
    teaGroup.add(cup);
    var cupRim = new THREE.Mesh(new THREE.TorusGeometry(1.155, 0.025, 8, 128), new THREE.MeshStandardMaterial({ color: 0xd4af6a, metalness: 1, roughness: 0.2 }));
    cupRim.rotation.x = Math.PI / 2; cupRim.position.set(2.2, -0.45, 0.6);
    teaGroup.add(cupRim);
    var cupTea = new THREE.Mesh(new THREE.CircleGeometry(1.06, 64), new THREE.MeshStandardMaterial({ color: 0x8a3b12, roughness: 0.12, metalness: 0, envMapIntensity: 0.35 }));
    cupTea.rotation.x = -Math.PI / 2; cupTea.position.set(2.2, -0.6, 0.6);
    teaGroup.add(cupTea);

    // Vapeur au-dessus de la tasse
    var STEAM = 160;
    var steamGeo = new THREE.BufferGeometry();
    var sp = new Float32Array(STEAM * 3), sseed = new Float32Array(STEAM);
    for (var s2 = 0; s2 < STEAM; s2++) { sseed[s2] = Math.random(); sp[s2 * 3 + 1] = rand(0, 3); }
    steamGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    var steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({ size: 0.5, map: dot, color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }));
    steam.position.set(2.2, -0.5, 0.6);
    teaGroup.add(steam);

    // Poussière dorée sur tout le parcours
    var DUST = 500, dg = new THREE.BufferGeometry(), dp = new Float32Array(DUST * 3);
    for (var d = 0; d < DUST; d++) { dp[d * 3] = rand(-20, 20); dp[d * 3 + 1] = rand(-2, 72); dp[d * 3 + 2] = rand(-20, 20); }
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    var dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.12, map: dot, color: 0xe8c27a, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    R = {
      renderer: renderer, scene: scene, camera: camera, dot: dot,
      hemi: hemi, accentLight: accentLight, sun: sun, mist: mist, stars: stars, dust: dust,
      teaGroup: teaGroup, ingGroup: ingGroup, ING_CENTER: ING_CENTER, TEA_CENTER: TEA_CENTER,
      liquidMat: liquidMat, steepLeaves: steepLeaves, steepLeafMat: steepLeafMat,
      cupTea: cupTea, steam: steam, sseed: sseed, smallLeafGeo: smallLeafGeo,
      ingredients: [], palette: null
    };
    resize();
  }

  /* ---------- Fabrique d'ingrédients 3D ---------- */
  function sliceTexture(color, pith) {
    var c = document.createElement("canvas"); c.width = c.height = 256;
    var g = c.getContext("2d");
    g.fillStyle = pith; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.fill();
    g.strokeStyle = pith; g.lineWidth = 6;
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2;
      g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); g.stroke();
    }
    g.fillStyle = pith; g.beginPath(); g.arc(128, 128, 12, 0, Math.PI * 2); g.fill();
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  function ingredientMesh(ing, family) {
    var geo, mat, count = 22, scale = 1;
    switch (ing.type) {
      case "leaf":
        geo = R.smallLeafGeo;
        mat = new THREE.MeshStandardMaterial({ color: ing.colors ? 0xffffff : family.leaf, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide });
        count = 34; scale = 1.1; break;
      case "pearl":
        geo = new THREE.DodecahedronGeometry(0.16, 1);
        mat = new THREE.MeshStandardMaterial({ color: 0x3f4a22, roughness: 0.8 }); count = 30; break;
      case "bud":
        geo = new THREE.CapsuleGeometry(0.07, 0.3, 6, 12);
        mat = new THREE.MeshStandardMaterial({ color: 0xe9e4d2, roughness: 1, emissive: 0x2a2a20 }); count = 32; break;
      case "needle":
        geo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6);
        mat = new THREE.MeshStandardMaterial({ color: 0xa8452a, roughness: 0.7 }); count = 60; break;
      case "strawberry":
        geo = new THREE.LatheGeometry([
          new THREE.Vector2(0.001, -0.32), new THREE.Vector2(0.12, -0.25), new THREE.Vector2(0.21, -0.05),
          new THREE.Vector2(0.22, 0.1), new THREE.Vector2(0.16, 0.2), new THREE.Vector2(0.001, 0.22)], 24);
        mat = new THREE.MeshPhysicalMaterial({ color: 0xc8213a, roughness: 0.3, clearcoat: 0.8 }); count = 16; break;
      case "rhubarb":
        geo = new THREE.CylinderGeometry(0.11, 0.13, 0.7, 10);
        mat = new THREE.MeshStandardMaterial({ color: 0xd2536a, roughness: 0.5 }); count = 14; break;
      case "orange":
      case "lemon":
        var col = ing.type === "orange" ? "#f08a24" : "#f2d43c";
        var tex = sliceTexture(col, "#fff3d6");
        geo = new THREE.CylinderGeometry(0.42, 0.42, 0.07, 32);
        mat = [
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }),
          new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6 }),
          new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.6 })
        ];
        count = 10; break;
      case "bergamot":
        geo = new THREE.SphereGeometry(0.3, 24, 16);
        mat = new THREE.MeshPhysicalMaterial({ color: 0xa9c43c, roughness: 0.45, clearcoat: 0.4 }); count = 8; break;
      case "petal":
        var ps = new THREE.Shape();
        ps.moveTo(0, 0); ps.bezierCurveTo(0.22, 0.1, 0.18, 0.4, 0, 0.45); ps.bezierCurveTo(-0.18, 0.4, -0.22, 0.1, 0, 0);
        geo = new THREE.ShapeGeometry(ps, 10);
        mat = new THREE.MeshStandardMaterial({ color: ing.color || family.accent, roughness: 0.6, side: THREE.DoubleSide }); count = 40; break;
      case "berry":
        geo = new THREE.SphereGeometry(0.13, 16, 12);
        mat = new THREE.MeshPhysicalMaterial({ color: 0x6e0f2c, roughness: 0.2, clearcoat: 1 }); count = 24; break;
      case "drop":
        geo = new THREE.SphereGeometry(0.2, 24, 16);
        mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, clearcoat: 1, transmission: 0.3, transparent: true, opacity: 0.9 });
        count = 30; break;
      case "matcha":
        geo = new THREE.IcosahedronGeometry(0.07, 0);
        mat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 1, emissive: 0x1a2a08 }); count = 160; scale = 1; break;
      case "cheese":
        geo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24, 1, false, 0, Math.PI / 3);
        mat = new THREE.MeshStandardMaterial({ color: 0xf1d27a, roughness: 0.7 }); count = 8; break;
      case "chocolate":
        geo = new THREE.BoxGeometry(0.5, 0.08, 0.35);
        mat = new THREE.MeshPhysicalMaterial({ color: 0x3b1f12, roughness: 0.35, clearcoat: 0.6 }); count = 10; break;
      default:
        geo = new THREE.IcosahedronGeometry(0.15, 0);
        mat = new THREE.MeshStandardMaterial({ color: family.accent });
    }
    var mesh = new THREE.InstancedMesh(geo, mat, count);
    var data = [];
    for (var i = 0; i < count; i++) {
      data.push({
        r: rand(1.6, 6), a: rand(0, Math.PI * 2), y: rand(-2.5, 2.5),
        sp: rand(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1),
        rot: new THREE.Euler(rand(0, 6), rand(0, 6), rand(0, 6)),
        rs: rand(-1, 1), s: scale * rand(0.8, 1.3)
      });
    }
    mesh.userData.items = data;
    if (ing.colors) {
      var c = new THREE.Color();
      for (var ci = 0; ci < count; ci++) mesh.setColorAt(ci, c.set(ing.colors[ci % ing.colors.length]));
      mesh.instanceColor.needsUpdate = true;
    }
    return mesh;
  }

  var dummy = null;

  function populate(item, family) {
    // Retire les anciens ingrédients
    R.ingredients.forEach(function (m) { R.ingGroup.remove(m); m.geometry !== R.smallLeafGeo && m.geometry.dispose(); });
    R.ingredients = item.ingredients.map(function (ing) {
      var m = ingredientMesh(ing, family);
      R.ingGroup.add(m);
      return m;
    });
    R.palette = {
      accent: new THREE.Color(family.accent),
      liquor: new THREE.Color(family.liquor),
      sky: new THREE.Color(family.sky)
    };
    R.steepLeafMat.color.set(family.leaf);
    R.cupTea.material.color.set(family.liquor).multiplyScalar(0.55);
    R.accentLight.color.set(family.accent);
  }

  /* ---------- Trajectoire de caméra ---------- */
  var KEYS = [
    { t: 0.00, p: [0, 10, 40], l: [0, 2, -10] },
    { t: 0.16, p: [3, 4.5, 12], l: [0, 1, -12] },
    { t: 0.26, p: [0, 18, 6], l: [0, 32, 0] },
    { t: 0.40, p: [0, 33, 11], l: [0, 32, 0] },
    { t: 0.50, p: [6, 34, 7], l: [0, 32, 0] },
    { t: 0.58, p: [0, 58, 15], l: [0, 61.5, 0] },
    { t: 0.72, p: [-1.0, 62.4, 7.5], l: [-1.0, 61.6, 0] },
    { t: 0.86, p: [1.6, 62.8, 7.4], l: [1.2, 61.4, 0.4] },
    { t: 1.00, p: [3.0, 64.0, 6.0], l: [2.0, 61.3, 0.6] }
  ];
  var vA = null, vB = null, lA = null, lB = null;
  function cameraAt(t, cam, look) {
    var k = 0;
    while (k < KEYS.length - 2 && t > KEYS[k + 1].t) k++;
    var a = KEYS[k], b = KEYS[k + 1];
    var u = smooth(a.t, b.t, t);
    vA.fromArray(a.p); vB.fromArray(b.p); lA.fromArray(a.l); lB.fromArray(b.l);
    cam.copy(vA).lerp(vB, u);
    look.copy(lA).lerp(lB, u);
  }

  /* ---------- Boucle ---------- */
  var state = { open: false, t: 0, target: 0, time: 0, mx: 0, my: 0, tmx: 0, tmy: 0, raf: 0 };
  var camPos, camLook, bg, tmpCol;
  var clock = null;

  function frame() {
    if (!state.open) return;
    state.raf = requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.05);
    if (!reduceMotion) state.time += dt;
    var time = state.time;
    // Lissage indépendant de la fréquence d'affichage
    var k = reduceMotion ? 1 : 1 - Math.exp(-dt * 4.5);
    state.t += (state.target - state.t) * k;
    state.mx += (state.tmx - state.mx) * (1 - Math.exp(-dt * 3));
    state.my += (state.tmy - state.my) * (1 - Math.exp(-dt * 3));
    var t = state.t, P = R.palette;

    // Caméra
    cameraAt(t, camPos, camLook);
    // Sur grand écran, décale la scène à l'opposé du texte de l'étape
    if (window.innerWidth >= 760) {
      var pan = 3.2 * smooth(0.24, 0.34, t) * (1 - smooth(0.5, 0.6, t))   // ingrédients : texte à droite
              - 2.6 * smooth(0.6, 0.72, t);                               // infusion & tasse : texte à gauche
      camPos.x += pan; camLook.x += pan;
    }
    camPos.x += state.mx * 0.8;
    camPos.y -= state.my * 0.5;
    R.camera.position.copy(camPos);
    R.camera.lookAt(camLook);

    // Ciel : aube teintée → nuit étoilée → salon chaud couleur du thé
    var dawn = 1 - smooth(0.18, 0.3, t);
    var steep = smooth(0.55, 0.8, t);
    bg.copy(P.sky).lerp(tmpCol.copy(P.accent).multiplyScalar(0.35), dawn * 0.6);
    bg.lerp(tmpCol.copy(P.liquor).multiplyScalar(0.18), steep);
    R.scene.background.copy(bg);
    R.scene.fog.color.copy(bg);
    R.scene.fog.density = 0.028 * dawn + 0.006;
    R.sun.material.color.copy(P.accent).lerp(tmpCol.set(0xffe2b0), 0.5);
    R.sun.material.opacity = dawn;
    R.mist.material.opacity = 0.16 * dawn;
    R.mist.position.x = Math.sin(time * 0.05) * 4;
    R.stars.material.opacity = 0.7 * smooth(0.2, 0.35, t) * (1 - steep * 0.6);
    R.hemi.intensity = 0.7 + steep * 0.3;

    // Ingrédients en orbite
    var ingVis = smooth(0.2, 0.34, t) * (1 - smooth(0.52, 0.62, t));
    R.ingGroup.visible = ingVis > 0.01;
    if (R.ingGroup.visible) {
      R.ingGroup.scale.setScalar(0.4 + ingVis * 0.6);
      R.ingGroup.rotation.y = time * 0.08 + t * 3;
      R.ingredients.forEach(function (mesh) {
        mesh.userData.items.forEach(function (it, i) {
          var a = it.a + time * it.sp;
          dummy.position.set(Math.cos(a) * it.r, it.y + Math.sin(time * 0.6 + it.a) * 0.35, Math.sin(a) * it.r);
          dummy.rotation.set(it.rot.x + time * it.rs * 0.5, it.rot.y + time * it.rs * 0.3, it.rot.z);
          dummy.scale.setScalar(it.s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
    }
    R.accentLight.position.set(R.ING_CENTER.x + Math.cos(time) * 4, R.ING_CENTER.y + 2, R.ING_CENTER.z + Math.sin(time) * 4);
    R.accentLight.intensity = 2.2;
    if (t > 0.55) {
      R.accentLight.position.set(R.TEA_CENTER.x + 3, R.TEA_CENTER.y + 3, R.TEA_CENTER.z + 4);
      R.accentLight.intensity = 0.9;
    }
    R.teaGroup.visible = t > 0.45; // évite de voir le plateau par en dessous

    // Infusion : l'eau se colore, les feuilles se déploient
    R.liquidMat.color.set(0xcfe6ee).lerp(P.liquor, steep);
    R.liquidMat.opacity = 0.3 + steep * 0.5;
    R.steepLeaves.forEach(function (lf) {
      var u = lf.userData;
      var a = u.a + time * u.sp * 0.6;
      lf.position.set(-1.3 + Math.cos(a) * u.r, u.y0 + Math.sin(time * u.sp + u.a) * 0.15, Math.sin(a) * u.r);
      lf.rotation.set(time * u.spin * 0.4, a, Math.sin(time + u.a) * 0.6);
      lf.scale.setScalar(0.25 + steep * 0.6);
    });

    // Vapeur
    var sArr = R.steam.geometry.attributes.position.array;
    for (var i = 0; i < R.sseed.length; i++) {
      var s = R.sseed[i];
      var y = (time * (0.3 + s * 0.3) + s * 3) % 3;
      sArr[i * 3] = Math.sin(y * 2 + s * 10) * 0.25 * y;
      sArr[i * 3 + 1] = y;
      sArr[i * 3 + 2] = Math.cos(y * 1.7 + s * 7) * 0.2 * y;
    }
    R.steam.geometry.attributes.position.needsUpdate = true;
    R.steam.material.opacity = 0.14 * smooth(0.7, 0.9, t);

    R.dust.rotation.y = time * 0.02;
    R.renderer.render(R.scene, R.camera);
  }

  function resize() {
    if (!R) return;
    var w = window.innerWidth, h = window.innerHeight;
    R.renderer.setSize(w, h, false);
    R.camera.aspect = w / h;
    R.camera.fov = w < 760 ? 62 : 50;
    R.camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  /* =======================================================
     Contenu HTML des 4 étapes
     ======================================================= */
  function renderAtelier(item) {
    var price = DATA.ATELIER_PRICE;
    function block(st, i) {
      var html = '<p class="eyebrow">Étape ' + (i + 1) + " · " + esc(item.stepLabels[i]) + "</p>";
      html += i === 0 ? '<h2 id="voyageTitle">' + esc(st.title) + "</h2>" : "<h3>" + esc(st.title) + "</h3>";
      if (st.lead) html += '<p class="vstep__lead">' + esc(st.lead) + "</p>";
      if (st.text) html += "<p>" + esc(st.text) + "</p>";
      if (st.list) html += '<ul class="vstep__ings">' + st.list.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>";
      return html;
    }
    var s = item.steps;
    stepsEl.innerHTML =
      '<section class="vstep vstep--intro">' + block(s[0], 0) + '<p class="vstep__hint">Faites défiler pour vivre l\'atelier</p></section>' +
      '<section class="vstep vstep--right">' + block(s[1], 1) + "</section>" +
      '<section class="vstep">' + block(s[2], 2) + "</section>" +
      '<section class="vstep vstep--final">' + block(s[3], 3) +
        '<ul class="vstep__notes">' + item.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
        '<p class="vstep__price">' + price + " € l'atelier · à vivre ou à offrir</p>" +
        '<div class="vstep__cta">' +
          '<a href="#reserver" class="btn btn--gold" data-close data-pick="' + item.id + '">Réserver cet atelier</a>' +
          '<a href="#offrir" class="btn btn--ghost" data-close>Offrir un atelier</a>' +
        "</div>" +
      "</section>";
    bindCtas();
  }

  function render(item, family, isProduct) {
    var ingList = item.ingredients.map(function (i) { return "<li>" + esc(i.label) + "</li>"; }).join("");
    var notes = item.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
    var price = isProduct
      ? (item.price ? esc(item.price) : "Prix et formats disponibles en boutique")
      : "Toute la famille " + esc(family.name.toLowerCase()) + " vous attend en boutique";

    stepsEl.innerHTML =
      '<section class="vstep vstep--intro">' +
        '<p class="eyebrow">Étape 1 · Origine</p>' +
        '<h2 id="voyageTitle">' + esc(item.name) + "</h2>" +
        '<p class="vstep__lead">' + esc(item.tagline) + "</p>" +
        "<p>" + esc(item.origin) + "</p>" +
        '<p class="vstep__hint">Faites défiler pour commencer le voyage</p>' +
      "</section>" +
      '<section class="vstep vstep--right">' +
        '<p class="eyebrow">Étape 2 · Ingrédients</p>' +
        "<h3>Ce qui compose la tasse</h3>" +
        '<ul class="vstep__ings">' + ingList + "</ul>" +
      "</section>" +
      '<section class="vstep">' +
        '<p class="eyebrow">Étape 3 · Infusion</p>' +
        "<h3>Le temps de l'éveil</h3>" +
        '<div class="vstep__infuse">' +
          '<div><strong data-count="' + family.temp + '">0</strong><span>°C</span></div>' +
          "<div><strong>" + esc(family.time) + "</strong><span>d'infusion</span></div>" +
        "</div>" +
        '<p class="vstep__small">Conseil général pour la famille ' + esc(family.name.toLowerCase()) + ". Suivez l'indication de l'étiquette.</p>" +
      "</section>" +
      '<section class="vstep vstep--final">' +
        '<p class="eyebrow">Étape 4 · La tasse</p>' +
        "<h3>" + esc(item.name) + "</h3>" +
        '<ul class="vstep__notes">' + notes + "</ul>" +
        '<p class="vstep__price">' + price + "</p>" +
        '<div class="vstep__cta">' +
          '<a href="#boutiques" class="btn btn--gold" data-close>Le découvrir en boutique</a>' +
          '<a href="#ateliers" class="btn btn--ghost" data-close>Le goûter en atelier</a>' +
        "</div>" +
      "</section>";

    bindCtas();
    counted = false;
  }

  function bindCtas() {
    stepsEl.querySelectorAll("[data-close]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = a.getAttribute("href");
        var pick = a.getAttribute("data-pick");
        if (pick) document.dispatchEvent(new CustomEvent("atelier:pick", { detail: pick }));
        close();
        setTimeout(function () { document.querySelector(target).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }, 350);
      });
    });
  }

  /* ---------- Défilement dans le voyage ---------- */
  var counted = false;
  function onScroll() {
    var max = overlay.scrollHeight - overlay.clientHeight;
    state.target = max > 0 ? overlay.scrollTop / max : 0;
    progressBar.style.transform = "scaleX(" + state.target.toFixed(3) + ")";
    var active = Math.min(3, Math.floor(state.target * 4 + 0.15));
    stepDots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); d.classList.toggle("is-done", i < active); });
    stepsEl.querySelectorAll(".vstep").forEach(function (s, i) { s.classList.toggle("is-active", i === active); });
    if (!counted && active >= 2) {
      counted = true;
      var el = stepsEl.querySelector("[data-count]");
      if (!el) return;
      var to = +el.getAttribute("data-count"), start = performance.now();
      (function tick(now) {
        var k = clamp01((now - start) / 1200);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      })(start);
    }
  }
  overlay.addEventListener("scroll", onScroll, { passive: true });
  overlay.addEventListener("pointermove", function (e) {
    state.tmx = (e.clientX / window.innerWidth) * 2 - 1;
    state.tmy = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  stepDots.forEach(function (d, i) {
    d.addEventListener("click", function () {
      var max = overlay.scrollHeight - overlay.clientHeight;
      overlay.scrollTo({ top: max * (i / 3), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* =======================================================
     Ouverture / fermeture
     ======================================================= */
  var lastFocus = null;

  function open(kind, id) {
    var item, family, isProduct = kind === "product";
    var isAtelier = kind === "atelier";
    if (isAtelier) {
      item = DATA.ATELIERS.filter(function (a) { return a.id === id; })[0];
      if (!item) return;
      family = item; // l'atelier porte sa propre palette
    } else if (isProduct) {
      item = DATA.PRODUCTS.filter(function (p) { return p.id === id; })[0];
      if (!item) return;
      family = DATA.FAMILIES[item.family];
    } else {
      family = DATA.FAMILIES[id];
      if (!family) return;
      item = family;
    }
    lastFocus = document.activeElement;
    overlay.style.setProperty("--accent", family.accent);
    overlay.style.setProperty("--liquor", family.liquor);
    if (isAtelier) { renderAtelier(item); counted = false; } else render(item, family, isProduct);
    var labels = isAtelier ? item.stepLabels : ["Origine", "Ingrédients", "Infusion", "La tasse"];
    stepDots.forEach(function (d, i) { d.querySelector("button").textContent = labels[i]; });

    overlay.hidden = false;
    overlay.scrollTop = 0;
    document.body.classList.add("voyage-open");
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });
    if (window.DammannScene) window.DammannScene.pause(true);

    if (hasGL) {
      try {
        if (!R) {
          buildScene();
          dummy = new THREE.Object3D();
          vA = new THREE.Vector3(); vB = new THREE.Vector3(); lA = new THREE.Vector3(); lB = new THREE.Vector3();
          camPos = new THREE.Vector3(); camLook = new THREE.Vector3(); bg = new THREE.Color(); tmpCol = new THREE.Color();
          clock = new THREE.Clock();
        }
        populate(item, family);
        resize();
        state.open = true; state.t = 0; state.target = 0; state.time = 0;
        clock.getDelta();
        cancelAnimationFrame(state.raf);
        frame();
      } catch (err) {
        console.warn("Voyage 3D indisponible", err);
        overlay.classList.add("is-flat");
      }
    } else {
      overlay.classList.add("is-flat");
    }
    onScroll();
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (overlay.hidden) return;
    state.open = false;
    cancelAnimationFrame(state.raf);
    overlay.classList.remove("is-open");
    document.body.classList.remove("voyage-open");
    if (window.DammannScene) window.DammannScene.pause(false);
    setTimeout(function () { overlay.hidden = true; }, 450);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // garde le focus dans le voyage
      var f = overlay.querySelectorAll("button, a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-voyage]");
    if (!trigger) return;
    e.preventDefault();
    var v = trigger.getAttribute("data-voyage").split(":");
    open(v[0], v[1]);
  });

  window.DammannVoyage = { open: open, close: close };
})();
