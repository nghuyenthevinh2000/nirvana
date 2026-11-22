import * as THREE from 'three';
import { materials } from './materials.js';

function shadow(o) {
  o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  return o;
}

function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function roadAndGround() {
  const g = new THREE.Group();
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x161924, roughness: 0.96, metalness: 0.05 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.005;
  ground.receiveShadow = true;
  g.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222634, roughness: 0.9, metalness: 0.1 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 56), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.002, -16);
  road.receiveShadow = true;
  g.add(road);

  // Subtle stone edge curbs
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x2f3446, roughness: 0.88 });
  for (const s of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 56), curbMat);
    curb.position.set(s * 1.35, 0.025, -16);
    g.add(curb);
  }
  return shadow(g);
}

export function voidGate() {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x1e2230, roughness: 0.9, metalness: 0.12 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x353b50, roughness: 0.75, metalness: 0.25 });

  for (const s of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.4, 0.8), stone);
    pillar.position.set(s * 1.75, 2.2, 0);
    g.add(pillar);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 1.05), trim);
    base.position.set(s * 1.75, 0.225, 0);
    g.add(base);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.28, 0.98), trim);
    cap.position.set(s * 1.75, 4.45, 0);
    g.add(cap);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.65, 0.95), stone);
  lintel.position.set(0, 4.85, 0);
  g.add(lintel);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 0.75), trim);
  crown.position.set(0, 5.3, 0);
  g.add(crown);
  return shadow(g);
}

export function deadLaptop() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xd6dce6, roughness: 0.3, metalness: 0.7 });
  const keys = new THREE.MeshStandardMaterial({ color: 0x3b4252, roughness: 0.6 });
  const screen = new THREE.MeshStandardMaterial({ color: 0x16243b, emissive: 0x0a1426, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.2 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.22), body);
  g.add(base);
  const kbd = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.12), keys);
  kbd.rotation.x = -Math.PI / 2;
  kbd.position.set(0, 0.01, 0.01);
  g.add(kbd);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.21, 0.014), body);
  lid.position.set(0, 0.105, -0.105);
  lid.rotation.x = -0.25;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), screen);
  scr.position.set(0, 0, 0.008);
  lid.add(scr);
  g.add(lid);
  return shadow(g);
}

export function ruinedTower() {
  const g = new THREE.Group();
  const conc = new THREE.MeshStandardMaterial({ color: 0xcabfa8, roughness: 0.85 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x5c89b3, roughness: 0.25, metalness: 0.55 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.18), conc);
  b1.position.y = 0.23;
  g.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.14), glass);
  b2.position.set(0.02, 0.50, 0);
  b2.rotation.z = 0.28; // broken tilted top
  g.add(b2);
  return shadow(g);
}

export function crackedHeart() {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.11);
  shape.bezierCurveTo(0.14, -0.02, 0.16, 0.11, 0.07, 0.13);
  shape.bezierCurveTo(0.02, 0.14, 0, 0.08, 0, 0.05);
  shape.bezierCurveTo(0, 0.08, -0.02, 0.14, -0.07, 0.13);
  shape.bezierCurveTo(-0.16, 0.11, -0.14, -0.02, 0, -0.11);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({ color: 0xd94452, roughness: 0.45, metalness: 0.08 });
  const mesh = new THREE.Mesh(geo, mat);
  g.add(mesh);
  // Dark crack line across the front
  const crack = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.18, 0.098),
    new THREE.MeshBasicMaterial({ color: 0x0b0c10 })
  );
  crack.rotation.z = 0.25;
  g.add(crack);
  return shadow(g);
}

export function lotusThrone({ radius = 0.9, petalCount = 12, glowing = true } = {}) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: glowing ? 0xd9a84e : 0x8d7652,
    emissive: glowing ? 0x6b4510 : 0x2a1a05,
    emissiveIntensity: glowing ? 0.6 : 0.15,
    roughness: 0.45,
  });
  const petalMat = new THREE.MeshStandardMaterial({
    color: glowing ? 0xffd778 : 0xe8b964,
    emissive: glowing ? 0xffb32c : 0x9a5c14,
    emissiveIntensity: glowing ? 0.85 : 0.35,
    roughness: 0.35,
  });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.68, radius * 0.82, 0.18, 24), baseMat);
  plinth.position.y = 0.09;
  g.add(plinth);

  const petals = [];
  const pGeo = new THREE.SphereGeometry(radius * 0.24, 12, 10);
  pGeo.scale(0.72, 1.35, 0.28);
  for (let ring = 0; ring < 2; ring++) {
    const n = ring === 0 ? petalCount : Math.floor(petalCount * 0.75);
    const r = radius * (ring === 0 ? 0.78 : 0.60);
    const y = ring === 0 ? 0.18 : 0.24;
    const tilt = ring === 0 ? 0.85 : 0.52;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.25;
      const p = new THREE.Mesh(pGeo, petalMat);
      p.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      p.rotation.y = -a + Math.PI / 2;
      p.rotation.x = tilt;
      g.add(p);
      petals.push(p);
    }
  }
  g.setProgress = (p) => {
    const count = Math.floor(Math.max(0, Math.min(1, p)) * petals.length);
    plinth.scale.y = 0.3 + 0.7 * Math.min(1, p * 3);
    petals.forEach((m, i) => { m.visible = i < count; });
  };
  return shadow(g);
}

// Articulated simple human figure for lying/standing/walking/building crowds
export function personFigure({ robeColor = 0x3b404e, skinColor = 0xd49b7a, scale = 1 } = {}) {
  const g = new THREE.Group();
  g.scale.setScalar(scale);
  const cloth = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.88 });
  const skin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.72 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x241a14, roughness: 0.85 });

  const hips = new THREE.Group(); hips.position.y = 0.82; g.add(hips);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.34, 6, 12), cloth);
  torso.position.y = 0.24; hips.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), skin);
  head.position.y = 0.58; hips.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.108, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  cap.position.y = 0.59; hips.add(cap);

  const makeLimb = (r, len, mat) => {
    const p = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 5, 10), mat);
    m.position.y = -len * 0.5 - r * 0.5;
    p.add(m);
    return p;
  };
  const armL = makeLimb(0.042, 0.42, cloth); armL.position.set(-0.18, 0.42, 0); hips.add(armL);
  const armR = makeLimb(0.042, 0.42, cloth); armR.position.set(0.18, 0.42, 0); hips.add(armR);
  const legL = makeLimb(0.056, 0.62, cloth); legL.position.set(-0.08, 0.02, 0); hips.add(legL);
  const legR = makeLimb(0.056, 0.62, cloth); legR.position.set(0.08, 0.02, 0); hips.add(legR);

  const holdSlot = new THREE.Group();
  holdSlot.position.set(0, 0.28, 0.22);
  hips.add(holdSlot);

  g.parts = { hips, head, armL, armR, legL, legR, holdSlot };
  g.hold = (obj) => {
    holdSlot.clear();
    if (obj) holdSlot.add(obj);
  };
  g.poseBack = () => {
    hips.position.set(0, 0.14, 0);
    hips.rotation.set(-Math.PI / 2 + 0.06, 0, 0);
    armL.rotation.set(-1.15, 0.35, 0.45);
    armR.rotation.set(-1.15, -0.35, -0.45);
    legL.rotation.set(0.08, 0, 0.08);
    legR.rotation.set(0.12, 0, -0.08);
  };
  g.poseSitting = () => {
    hips.position.set(0, 0.16, 0);
    hips.rotation.set(0.2, 0, 0);
    armL.rotation.set(-1.05, 0.35, 0.4);
    armR.rotation.set(-1.05, -0.35, -0.4);
    legL.rotation.set(-Math.PI / 2 + 0.18, 0.12, 0.14);
    legR.rotation.set(-Math.PI / 2 + 0.18, -0.12, -0.14);
  };
  g.poseLying = g.poseBack;
  g.poseWalk = (phase = 0) => {
    hips.position.set(0, 0.82 + Math.abs(Math.sin(phase)) * 0.03, 0);
    hips.rotation.set(0.06, 0, 0);
    legL.rotation.set(Math.sin(phase) * 0.45, 0, 0);
    legR.rotation.set(-Math.sin(phase) * 0.45, 0, 0);
    armL.rotation.set(-Math.sin(phase) * 0.35, 0, 0.06);
    armR.rotation.set(Math.sin(phase) * 0.35, 0, -0.06);
  };
  g.poseBuild = (phase = 0) => {
    hips.position.set(0, 0.64, 0);
    hips.rotation.set(0.45 + Math.sin(phase) * 0.08, 0, 0);
    legL.rotation.set(-0.55, 0, 0.1);
    legR.rotation.set(-0.55, 0, -0.1);
    armL.rotation.set(-1.1 + Math.sin(phase) * 0.2, 0, -0.15);
    armR.rotation.set(-1.1 + Math.cos(phase) * 0.2, 0, 0.15);
  };
  return shadow(g);
}

let _glow;
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.28, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function glowSprite(color = 0xffffff, size = 1) {
  _glow = _glow || glowTex();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: _glow, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
  s.scale.setScalar(size);
  return s;
}

export function auraRings(count = 4, color = 0xffcc55) {
  const g = new THREE.Group();
  const rings = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(0.9 + i * 0.32, 0.01, 10, 64),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 - i * 0.08, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.04;
    g.add(m); rings.push(m);
  }
  g.update = (t) => {
    rings.forEach((m, i) => {
      const p = ((t * 0.4 + i / count) % 1);
      m.scale.setScalar(0.85 + p * 0.55);
      m.material.opacity = (1 - p) * 0.4;
    });
  };
  return g;
}

export function sparks(count = 70, { speed = 0.25, spread = 1.4, gravity = 0.1, life = 4.0, color = [1, 0.85, 0.45], size = 0.018, seed = 9, dir = new THREE.Vector3(0, 1, 0) } = {}) {
  const r = rng(seed);
  _glow = _glow || glowTex();
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, map: _glow, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  const V = [], Lf = [];
  const d = dir.clone().normalize();
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(spread).add(d).normalize().multiplyScalar(speed * (0.3 + r() * 0.9));
    V.push(v); Lf.push(life * (0.4 + r() * 0.8));
  }
  pts.update = (t) => {
    for (let i = 0; i < count; i++) {
      const tt = (Math.max(0, t) + i * 0.17) % Lf[i], v = V[i];
      pos[i * 3] = v.x * tt; pos[i * 3 + 1] = v.y * tt + 0.5 * gravity * tt * tt; pos[i * 3 + 2] = v.z * tt;
      const a = Math.sin((tt / Lf[i]) * Math.PI);
      col[i * 3] = color[0] * a * 2.2; col[i * 3 + 1] = color[1] * a * 2.2; col[i * 3 + 2] = color[2] * a * 2.2;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
  };
  pts.update(0.1);
  return pts;
}
