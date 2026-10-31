/* =========================================================
   Scène 3D « Noir Céleste »
   Une feuille de thé dorée flotte, entourée de vapeur et
   d'anneaux. Elle suit la souris et se déplie au défilement.
   ========================================================= */
(function () {
  "use strict";

  var canvas = document.getElementById("scene");
  var root = document.documentElement;

  function fallback() { root.classList.add("no-webgl"); }

  if (!window.THREE || !canvas) { fallback(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { fallback(); return; }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x0b0b0c, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b0c, 0.035);

  var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  /* ---------- Environnement (reflets du métal) ---------- */
  (function buildEnvironment() {
    var env = new THREE.Scene();
    env.background = new THREE.Color(0x0a0a0a);
    function panel(color, w, h, pos, rot) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide }));
      m.position.copy(pos); m.rotation.set(rot[0], rot[1], rot[2]); env.add(m);
    }
    panel(0xfff1d6, 6, 2, new THREE.Vector3(0, 5, 0), [Math.PI / 2, 0, 0]);   // lumière chaude zénithale
    panel(0xc9a45c, 3, 6, new THREE.Vector3(-5, 0, 1), [0, Math.PI / 2, 0]);  // reflet or
    panel(0x2f7f69, 3, 6, new THREE.Vector3(5, 0, -1), [0, -Math.PI / 2, 0]); // reflet jade
    panel(0x3a3020, 8, 3, new THREE.Vector3(0, -4, 0), [-Math.PI / 2, 0, 0]);
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
  })();

  /* ---------- Lumières ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  var key = new THREE.DirectionalLight(0xffe2b0, 1.6);
  key.position.set(3, 4, 5);
  scene.add(key);
  var rim = new THREE.PointLight(0x4fa38a, 2.2, 14);
  rim.position.set(-3, -1, -2);
  scene.add(rim);
  var glow = new THREE.PointLight(0xe8b860, 1.6, 10);
  scene.add(glow);

  /* ---------- Groupe principal ---------- */
  var hero = new THREE.Group();
  scene.add(hero);

  /* ---------- Feuille de thé ---------- */
  // Coordonnées de la feuille : x ∈ [-1.1, 1.1], y ∈ [-1.7, 1.9]
  var LEAF = { minX: -1.1, maxX: 1.1, minY: -1.7, maxY: 1.9 };

  var shape = new THREE.Shape();
  shape.moveTo(0, -1.6);
  shape.bezierCurveTo(0.95, -1.05, 1.05, 0.75, 0, 1.85);
  shape.bezierCurveTo(-1.05, 0.75, -0.95, -1.05, 0, -1.6);

  var leafGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02,
    bevelSegments: 2, curveSegments: 64, steps: 1
  });
  leafGeo.translate(0, 0, -0.015);

  // Version « à plat » (cible du morph) et version « courbée » (état initial)
  var flatPos = leafGeo.attributes.position.array.slice();
  var pos = leafGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    var curl = 0.55 * x * x;                 // bords relevés
    var arch = -0.12 * (y - 0.1) * (y - 0.1); // feuille arquée
    var twist = 0.18 * x * y;                // légère torsion
    pos.setZ(i, z + curl + arch + twist);
  }
  leafGeo.computeVertexNormals();

  var flatGeo = leafGeo.clone();
  flatGeo.attributes.position.array.set(flatPos);
  flatGeo.computeVertexNormals();
  leafGeo.morphAttributes.position = [new THREE.Float32BufferAttribute(flatPos, 3)];
  leafGeo.morphAttributes.normal = [flatGeo.attributes.normal.clone()];
  flatGeo.dispose();

  // Texture de nervures dessinée en canvas
  function veinTexture() {
    var W = 512, H = 840;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    function px(x, y) {
      return [
        (x - LEAF.minX) / (LEAF.maxX - LEAF.minX) * W,
        (LEAF.maxY - y) / (LEAF.maxY - LEAF.minY) * H
      ];
    }
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#7a6232";
    g.lineCap = "round";

    // nervure centrale
    var a = px(0, -1.6), b = px(0, 1.8);
    g.lineWidth = 7;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();

    // nervures secondaires
    for (var t = 0; t < 9; t++) {
      var y0 = -1.25 + t * 0.34;
      var w = 0.9 * Math.sin(((y0 + 1.6) / 3.45) * Math.PI) + 0.05;
      g.lineWidth = 4 - t * 0.25;
      [-1, 1].forEach(function (s) {
        var p0 = px(0, y0), p1 = px(s * w * 0.45, y0 + 0.12), p2 = px(s * w * 0.85, y0 + 0.42);
        g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); g.stroke();
      });
    }
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    // Les faces avant de ExtrudeGeometry ont des UV = coordonnées (x, y)
    tex.repeat.set(1 / (LEAF.maxX - LEAF.minX), 1 / (LEAF.maxY - LEAF.minY));
    tex.offset.set(-LEAF.minX / (LEAF.maxX - LEAF.minX), -LEAF.minY / (LEAF.maxY - LEAF.minY));
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }
  var veins = veinTexture();

  var leafMat = new THREE.MeshPhysicalMaterial({
    color: 0xd9b26a,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
    map: veins,
    bumpMap: veins,
    bumpScale: 0.015,
    envMapIntensity: 1.25,
    side: THREE.DoubleSide
  });

  var leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.rotation.z = -0.35;
  var leafPivot = new THREE.Group();
  leafPivot.add(leaf);
  hero.add(leafPivot);

  /* ---------- Anneaux & structure holographique ---------- */
  function ring(radius, color, opacity, tilt) {
    var m = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.006, 8, 220),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity })
    );
    m.rotation.set(tilt[0], tilt[1], tilt[2]);
    hero.add(m);
    return m;
  }
  var ring1 = ring(2.55, 0xc9a45c, 0.55, [1.25, 0.25, 0]);
  var ring2 = ring(2.95, 0x4fa38a, 0.35, [1.1, -0.45, 0.4]);
  var ring3 = ring(3.4, 0xe8d3a3, 0.15, [1.5, 0.1, -0.3]);

  var holo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.9, 1),
    new THREE.MeshBasicMaterial({ color: 0xc9a45c, wireframe: true, transparent: true, opacity: 0.05 })
  );
  hero.add(holo);

  // Petites « graines » lumineuses en orbite
  var orbiters = [];
  for (var o = 0; o < 3; o++) {
    var s = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: o === 1 ? 0x7fd6bb : 0xffe2a8 })
    );
    hero.add(s);
    orbiters.push({ mesh: s, ring: [ring1, ring2, ring3][o], speed: 0.25 + o * 0.12, phase: o * 2.1 });
  }

  /* ---------- Particules : vapeur & poussière d'or ---------- */
  function softDot() {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var dot = softDot();

  var STEAM = 650;
  var steamGeo = new THREE.BufferGeometry();
  var steamPos = new Float32Array(STEAM * 3);
  var steamCol = new Float32Array(STEAM * 3);
  var steamSeed = new Float32Array(STEAM);
  var gold = new THREE.Color(0xe8c27a), creme = new THREE.Color(0xf3ead8), jade = new THREE.Color(0x6fc7aa);
  function resetSteam(i, randomY) {
    var r = Math.random() * 1.3;
    var a = Math.random() * Math.PI * 2;
    steamPos[i * 3] = Math.cos(a) * r;
    steamPos[i * 3 + 1] = randomY ? -2.4 + Math.random() * 5.5 : -2.4;
    steamPos[i * 3 + 2] = Math.sin(a) * r * 0.6;
  }
  for (var k = 0; k < STEAM; k++) {
    resetSteam(k, true);
    steamSeed[k] = Math.random() * 100;
    var col = Math.random() < 0.12 ? jade : (Math.random() < 0.5 ? gold : creme);
    steamCol[k * 3] = col.r; steamCol[k * 3 + 1] = col.g; steamCol[k * 3 + 2] = col.b;
  }
  steamGeo.setAttribute("position", new THREE.BufferAttribute(steamPos, 3));
  steamGeo.setAttribute("color", new THREE.BufferAttribute(steamCol, 3));
  var steam = new THREE.Points(steamGeo, new THREE.PointsMaterial({
    size: 0.07, map: dot, vertexColors: true, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  hero.add(steam);

  var DUST = 1400;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(DUST * 3);
  for (var d = 0; d < DUST; d++) {
    var rr = 6 + Math.random() * 16;
    var th = Math.random() * Math.PI * 2;
    var ph = Math.acos(2 * Math.random() - 1);
    dustPos[d * 3] = rr * Math.sin(ph) * Math.cos(th);
    dustPos[d * 3 + 1] = rr * Math.sin(ph) * Math.sin(th);
    dustPos[d * 3 + 2] = rr * Math.cos(ph) - 6;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.05, map: dot, color: 0xc9a45c, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(dust);

  /* ---------- Interaction ---------- */
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var scroll = { p: 0, target: 0 };
  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.target = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener("scroll", readScroll, { passive: true });

  var isMobile = false;
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    isMobile = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = isMobile ? 48 : 35;
    camera.updateProjectionMatrix();
    readScroll();
  }
  window.addEventListener("resize", resize);
  resize();

  function smoothstep(a, b, v) { var t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* ---------- Boucle d'animation ---------- */
  var clock = new THREE.Clock();
  var time = 0;

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    if (!reduceMotion) time += dt;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    scroll.p += (scroll.target - scroll.p) * 0.06;
    var p = scroll.p;

    // Position du groupe : à droite du titre, puis glisse d'un côté à l'autre au fil des sections
    var heroOut = smoothstep(0, 0.18, p);
    var sideX = isMobile ? 0 : 2.35 * Math.cos(p * Math.PI * 3);
    hero.position.x = sideX;
    hero.position.y = (isMobile ? 2.3 : 0.05) * (1 - heroOut) + Math.sin(time * 0.6) * 0.08;
    hero.position.z = -heroOut * 3.5;
    var sc = (isMobile ? 0.45 : 1) * (1 - heroOut * 0.2);
    // Après le hero, la scène s'atténue pour laisser le texte lisible
    var fade = (1 - heroOut * 0.55).toFixed(3);
    if (canvas.style.opacity !== fade) canvas.style.opacity = fade;
    hero.scale.setScalar(sc);

    // Feuille : se déplie au défilement, flotte et suit la souris
    leaf.morphTargetInfluences[0] = smoothstep(0.02, 0.3, p);
    leafPivot.rotation.y = time * 0.25 + p * Math.PI * 4 + mouse.x * 0.6;
    leafPivot.rotation.x = -0.25 + mouse.y * 0.35 + Math.sin(time * 0.8) * 0.06;
    leafPivot.rotation.z = Math.sin(time * 0.5) * 0.05;

    ring1.rotation.z = time * 0.12;
    ring2.rotation.z = -time * 0.09;
    ring3.rotation.z = time * 0.05;
    holo.rotation.y = time * 0.04 + p * 1.5;
    holo.rotation.x = time * 0.02;

    orbiters.forEach(function (ob) {
      var a = time * ob.speed + ob.phase;
      var r = ob.ring.geometry.parameters.radius;
      var v = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
      v.applyEuler(ob.ring.rotation);
      ob.mesh.position.copy(v);
    });

    // Vapeur
    if (!reduceMotion) {
      for (var i = 0; i < STEAM; i++) {
        var iy = i * 3 + 1;
        steamPos[iy] += dt * (0.25 + (steamSeed[i] % 1) * 0.35);
        steamPos[i * 3] += Math.sin(time * 0.8 + steamSeed[i]) * dt * 0.08;
        if (steamPos[iy] > 3.2) resetSteam(i, false);
      }
      steamGeo.attributes.position.needsUpdate = true;
    }

    dust.rotation.y = time * 0.01 + mouse.x * 0.05;
    dust.rotation.x = mouse.y * 0.03 + p * 0.4;

    glow.position.set(Math.cos(time * 0.7) * 2.5, Math.sin(time * 0.5) * 1.5, 2);

    camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
