
 
(function () {
  const PALETTES = {
    default:    { a: 0x4f8cff, b: 0x8b6cff, c: 0xc77dff, d: 0x5ce1e6 },
    hero:       { a: 0x4f8cff, b: 0x8b6cff, c: 0xc77dff, d: 0x5ce1e6 },
    cover:      { a: 0x4f8cff, b: 0x8b6cff, c: 0x5ce1e6, d: 0xc77dff },
    dedication: { a: 0x8b6cff, b: 0xc77dff, c: 0x4f8cff, d: 0x5ce1e6 },
    thanks:     { a: 0x5ce1e6, b: 0x4f8cff, c: 0x8b6cff, d: 0xc77dff },
    toc:        { a: 0x8b6cff, b: 0x4f8cff, c: 0xc77dff, d: 0x5ce1e6 },
    chapters:   { a: 0x4f8cff, b: 0xc77dff, c: 0x8b6cff, d: 0x5ce1e6 },
    conclusion: { a: 0xc77dff, b: 0x8b6cff, c: 0x4f8cff, d: 0x5ce1e6 },
    auth:       { a: 0x4f8cff, b: 0x8b6cff, c: 0xc77dff, d: 0x5ce1e6 }
  };

  
  let _glowTex = null;
  function glowTexture() {
    if (_glowTex) return _glowTex;
    const size = 256;
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = size;
    const ctx = cnv.getContext('2d');
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    _glowTex = new THREE.CanvasTexture(cnv);
    return _glowTex;
  }

  function makeSprite(color, size, opacity) {
    const mat = new THREE.SpriteMaterial({
      map: glowTexture(), color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

 
  const GALLERY_IMAGES = [
    'https://picsum.photos/seed/aurora-report-1/500/700',
    'https://picsum.photos/seed/aurora-report-2/500/700',
    'https://picsum.photos/seed/aurora-report-3/500/700',
    'https://picsum.photos/seed/aurora-report-4/500/700',
    'https://picsum.photos/seed/aurora-report-5/500/700',
    'https://picsum.photos/seed/aurora-report-6/500/700',
    'https://picsum.photos/seed/aurora-report-7/500/700',
    'https://picsum.photos/seed/aurora-report-8/500/700'
  ];

  let _roundMask = null;
  function roundedMaskTexture() {
    if (_roundMask) return _roundMask;
    const w = 400, h = 560, r = 34;
    const cnv = document.createElement('canvas');
    cnv.width = w; cnv.height = h;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();
    _roundMask = new THREE.CanvasTexture(cnv);
    return _roundMask;
  }

  function buildPhotoCard(url, color, w, h, maxOpacity) {
    maxOpacity = maxOpacity === undefined ? 1 : maxOpacity;
    const group = new THREE.Group();

    const halo = makeSprite(color, Math.max(w, h) * 1.9, 0.35 * maxOpacity);
    halo.position.z = -0.05;
    group.add(halo);

    const frameGeo = new THREE.PlaneGeometry(w * 1.06, h * 1.06);
    const frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.55 * maxOpacity, alphaMap: roundedMaskTexture()
    }));
    frame.position.z = -0.02;
    group.add(frame);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0,
      alphaMap: roundedMaskTexture()
    });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    group.add(photo);

    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
      mat.map = tex;
      mat.opacity = maxOpacity;
      mat.needsUpdate = true;
      if (window.gsap) {
        gsap.fromTo(mat, { opacity: 0 }, { opacity: maxOpacity, duration: 0.8, ease: 'power2.out' });
      }
    }, undefined, () => { /* échec réseau : le cadre + halo restent visibles */ });

    return group;
  }

 
  function buildPhotoOrbit(palette, camera, count, radius, cardSize, opts) {
    opts = opts || {};
    const orbit = new THREE.Group();
    const cards = [];
    const colors = [palette.a, palette.b, palette.c, palette.d];
    for (let i = 0; i < count; i++) {
      const url = GALLERY_IMAGES[i % GALLERY_IMAGES.length];
      const color = colors[i % colors.length];
      const card = buildPhotoCard(url, color, cardSize.w, cardSize.h, opts.opacity);
      const angle = (i / count) * Math.PI * 2;
      card.userData = {
        angle, radius, speed: opts.speed || 0.05,
        bobPhase: Math.random() * Math.PI * 2,
        baseY: (Math.random() - 0.5) * (opts.spreadY || 2)
      };
      orbit.add(card);
      cards.push(card);
    }
    orbit.userData = { cards, camera };
    return orbit;
  }

  function updatePhotoOrbit(orbit, t) {
    const { cards, camera } = orbit.userData;
    cards.forEach((card) => {
      const d = card.userData;
      const a = d.angle + t * d.speed;
      card.position.set(Math.cos(a) * d.radius, d.baseY + Math.sin(t * 0.6 + d.bobPhase) * 0.25, Math.sin(a) * d.radius);
      card.lookAt(camera.position);
    });
  }

  function makeBase(mount) {
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 9);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    return { w, h, scene, camera, renderer };
  }

  function mouseTracker() {
    const m = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      m.x = e.clientX / window.innerWidth - 0.5;
      m.y = e.clientY / window.innerHeight - 0.5;
    });
    window.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      m.x = e.touches[0].clientX / window.innerWidth - 0.5;
      m.y = e.touches[0].clientY / window.innerHeight - 0.5;
    }, { passive: true });
    return m;
  }

  function buildCrystalCore(palette, radius) {
    const geo = new THREE.IcosahedronGeometry(radius, 3);
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const n = v.clone().normalize();
      const noise = 0.9 + Math.sin(v.x * 3.1 + v.y * 2.3) * 0.06 + Math.cos(v.z * 4.1) * 0.05;
      v.copy(n.multiplyScalar(radius * noise));
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    const group = new THREE.Group();
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: palette.b, wireframe: true, transparent: true, opacity: 0.45
    }));
    group.add(wire);

    const shell = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({
      color: palette.a, transparent: true, opacity: 0.06, side: THREE.BackSide
    }));
    shell.scale.setScalar(1.04);
    group.add(shell);

    group.add(makeSprite(palette.b, radius * 4.6, 0.5));
    group.add(makeSprite(palette.c, radius * 7.5, 0.22));

    return { group, wire };
  }

  
  function buildRing(color, r, tube, pos, tilt, speed) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 16, 120),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
    );
    ring.position.set(...pos);
    ring.rotation.x = tilt;
    ring.rotation.y = Math.random() * Math.PI;
    ring.userData.speed = speed;
    return ring;
  }

  
  function buildKnot(color, pos, scale) {
    const geo = new THREE.TorusKnotGeometry(0.55, 0.05, 100, 12, 2, 3);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 }));
    mesh.position.set(...pos);
    mesh.scale.setScalar(scale);
    return mesh;
  }

  
  function buildSatellite(color, radius, orbitR, speed, tilt, phase) {
    const sat = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16),
      new THREE.MeshBasicMaterial({ color }));
    sat.add(core);
    sat.add(makeSprite(color, radius * 10, 0.6));
    sat.userData = { orbitR, speed, tilt, phase };
    return sat;
  }

  function buildScene(mount, palette, mode) {
    const { scene, camera, renderer } = makeBase(mount);
    const group = new THREE.Group();
    scene.add(group);

    const isStage = mode === 'stage';
    const coreRadius = isStage ? 1.5 : 1;

    const { group: coreGroup, wire } = buildCrystalCore(palette, coreRadius);
    coreGroup.position.set(isStage ? 0 : 2.2, isStage ? 0.2 : 0.6, isStage ? -1 : -2);
    group.add(coreGroup);

    
    const ringDefs = isStage ? [
      { r: 3.4, tube: 0.014, color: palette.a, tilt: 0.55, pos: [0, 0, 0], speed: 0.0022 },
      { r: 2.5, tube: 0.011, color: palette.b, tilt: 1.15, pos: [0, 0, 0], speed: -0.003 },
      { r: 4.3, tube: 0.008, color: palette.d, tilt: 0.15, pos: [0, 0, 0], speed: 0.0015 }
    ] : [
      { r: 3.2, tube: 0.012, color: palette.a, tilt: 0.6, pos: [-2.6, 1.2, -3], speed: 0.0025 },
      { r: 2.1, tube: 0.01, color: palette.b, tilt: 1.1, pos: [2.6, -1.4, -1.5], speed: -0.0032 },
      { r: 1.4, tube: 0.008, color: palette.c, tilt: 0.3, pos: [-1.6, -1.8, -2.5], speed: 0.004 },
      { r: 4.0, tube: 0.006, color: palette.d, tilt: 1.4, pos: [1.2, 2.4, -4], speed: -0.0018 }
    ];
    const rings = ringDefs.map((d) => buildRing(d.color, d.r, d.tube, d.pos, d.tilt, d.speed));
    rings.forEach((r) => group.add(r));

   
    const knots = [
      buildKnot(palette.c, isStage ? [-3.4, 1.6, -2] : [-3.2, -1.6, -3.5], isStage ? 0.9 : 0.7),
      buildKnot(palette.a, isStage ? [3.2, -1.8, -2.4] : [3.4, 1.8, -4], isStage ? 0.7 : 0.55)
    ];
    knots.forEach((k) => group.add(k));

    
    const satellites = [
      buildSatellite(palette.d, 0.07, isStage ? 2.5 : 1.9, 0.6, 0.4, 0),
      buildSatellite(palette.c, 0.05, isStage ? 3.4 : 2.6, -0.4, 1.1, 2.1),
      buildSatellite(palette.a, 0.09, isStage ? 4.2 : 3.1, 0.3, 0.9, 4.4)
    ];
    satellites.forEach((s) => group.add(s));

    
    const N = isStage ? 420 : 300;
    const pos = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    const phases = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * (isStage ? 14 : 16);
      pos[i * 3 + 1] = (Math.random() - 0.5) * (isStage ? 9 : 10);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      speeds[i] = 0.0015 + Math.random() * 0.003;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: palette.c, size: 0.05, transparent: true, opacity: 0.6, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    group.add(particles);

    
    const photoOrbit = buildPhotoOrbit(
      palette,
      camera,
      isStage ? 6 : 3,
      isStage ? 4.6 : 5.4,
      isStage ? { w: 1.15, h: 1.6 } : { w: 0.85, h: 1.18 },
      { speed: isStage ? 0.07 : 0.045, spreadY: isStage ? 2.2 : 3, opacity: isStage ? 1 : 0.4 }
    );
    group.add(photoOrbit);

    
    const comets = [];
    function spawnComet() {
      const start = new THREE.Vector3((Math.random() - 0.5) * 10, 5 + Math.random() * 2, (Math.random() - 0.5) * 6 - 2);
      const dir = new THREE.Vector3(-0.6 + Math.random() * -0.6, -1, (Math.random() - 0.5) * 0.4).normalize();
      const points = [start.clone(), start.clone().add(dir.clone().multiplyScalar(-1.4))];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: palette.d, transparent: true, opacity: 0.9 });
      const line = new THREE.Line(geo, mat);
      line.userData = { pos: start, dir, life: 0 };
      group.add(line);
      comets.push(line);
    }
    let cometTimer = 0;

    const m = mouseTracker();
    let t = 0;
    let raf;
    (function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.01;

      coreGroup.rotation.y += 0.0022;
      coreGroup.rotation.x += 0.001;
      wire.rotation.y -= 0.0015;
      const breathe = 1 + Math.sin(t * 0.8) * 0.045;
      coreGroup.scale.setScalar(breathe);

      rings.forEach((r) => { r.rotation.z += r.userData.speed; r.rotation.y += r.userData.speed * 0.4; });
      knots.forEach((k, i) => { k.rotation.x += 0.0018 * (i ? -1 : 1); k.rotation.y += 0.0026; });

      satellites.forEach((s) => {
        const { orbitR, speed, tilt, phase } = s.userData;
        const a = t * speed + phase;
        s.position.set(
          Math.cos(a) * orbitR,
          Math.sin(a * 0.7) * orbitR * Math.sin(tilt),
          Math.sin(a) * orbitR * Math.cos(tilt)
        );
        s.position.add(coreGroup.position);
      });

      const arr = pGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        arr[i * 3 + 1] += speeds[i];
        if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.material.opacity = 0.45 + Math.sin(t * 2) * 0.15;
      particles.rotation.y += 0.0006;

      updatePhotoOrbit(photoOrbit, t);

      cometTimer += 1;
      if (cometTimer > (isStage ? 90 : 160) && comets.length < 3) {
        spawnComet();
        cometTimer = 0;
      }
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.userData.life += 0.02;
        c.position.add(c.userData.dir.clone().multiplyScalar(0.12));
        c.material.opacity = Math.max(0, 0.9 - c.userData.life);
        if (c.userData.life > 1) {
          group.remove(c);
          comets.splice(i, 1);
        }
      }

      group.rotation.y += (m.x * (isStage ? 0.22 : 0.35) - group.rotation.y) * 0.02;
      group.rotation.x += (m.y * (isStage ? 0.12 : 0.2) - group.rotation.x) * 0.02;

      renderer.render(scene, camera);
    })();

    window.addEventListener('resize', () => {
      const w2 = mount.clientWidth || window.innerWidth;
      const h2 = mount.clientHeight || window.innerHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });

    return () => cancelAnimationFrame(raf);
  }

  function initMount(mount) {
    if (!mount || !window.THREE) return;
    const key = mount.getAttribute('data-scene') || 'default';
    const mode = mount.getAttribute('data-mode') || 'ambient';
    const palette = PALETTES[key] || PALETTES.default;
    try {
      buildScene(mount, palette, mode);
    } catch (e) {
      console.warn('hero3d disabled:', e);
    }
  }

  function init() {
    document.querySelectorAll('#hero3d, #hero3d-stage, [data-hero3d]').forEach(initMount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
