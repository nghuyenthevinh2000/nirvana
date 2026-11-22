import * as THREE from 'three';
import { materials } from './materials.js';

function shadowAll(o) {
  o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
}

// Smooth variable-radius swept tube along a 3D curve (seamless organic limbs & folds)
function sweptTube(points, radii, { tubularSegs = 40, radialSegs = 20, capEnds = true } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const frames = curve.computeFrenetFrames(tubularSegs, false);
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i <= tubularSegs; i++) {
    const t = i / tubularSegs;
    const P = curve.getPointAt(t);
    const N = frames.normals[i], B = frames.binormals[i];
    // interpolate radius
    const rf = t * (radii.length - 1);
    const r0 = Math.floor(rf), r1 = Math.min(radii.length - 1, r0 + 1);
    const r = radii[r0] + (radii[r1] - radii[r0]) * (rf - r0);
    for (let j = 0; j <= radialSegs; j++) {
      const v = (j / radialSegs) * Math.PI * 2;
      const sin = Math.sin(v), cos = -Math.cos(v);
      const vx = P.x + r * (cos * N.x + sin * B.x);
      const vy = P.y + r * (cos * N.y + sin * B.y);
      const vz = P.z + r * (cos * N.z + sin * B.z);
      pos.push(vx, vy, vz);
      uvs.push(j / radialSegs, t);
    }
  }
  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j, b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1), d = i * stride + (j + 1);
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (capEnds) {
    // subtle spherical end caps are handled by overlapping into torso/hand
  }
  return g;
}

// Sculpted continuous human head (no separate nose/cheek/jaw blocks)
function buildSculptedHead(M, { topknot = true, longEars = true, beard = false, child = false } = {}) {
  const head = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.106, 64, 48);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // Oval cranium + tapered human jaw/chin
    x *= child ? 0.90 : 0.85;
    y *= child ? 1.04 : 1.12;
    z *= 0.96;
    if (y < 0) {
      const jawT = Math.min(1, -y / 0.11);
      x *= 1 - jawT * (child ? 0.24 : 0.30);
      if (z > 0) z *= 1 - jawT * 0.10;
    }
    // Gentle forehead & brow ridge
    if (z > 0.03 && y > 0.01 && y < 0.045) {
      z += 0.006 * Math.exp(-((x / 0.06) ** 2));
    }
    // Subtle nose bridge & tip sculpted directly from face mesh
    if (z > 0.05 && y > -0.028 && y < 0.032) {
      const nx = Math.exp(-((x / 0.013) ** 2));
      const ny = Math.exp(-(((y - 0.002) / 0.024) ** 2));
      const tip = Math.exp(-(((y + 0.012) / 0.010) ** 2)) * 0.012;
      z += (0.015 * ny + tip) * nx;
    }
    // Gentle chin prominence
    if (z > 0.03 && y < -0.055) {
      z += 0.008 * Math.exp(-((x / 0.022) ** 2)) * Math.exp(-(((y + 0.075) / 0.02) ** 2));
    }
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  const skull = new THREE.Mesh(geo, M.skin);
  skull.position.y = 0.095;
  head.add(skull);

  // Calm eyes + smooth eyelids + gentle horizontal brows
  const lids = [];
  for (const s of [-1, 1]) {
    const ex = s * 0.034, ey = 0.108, ez = 0.086;
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.013, 24, 16), M.eyeWhite);
    eyeW.scale.set(1.15, 0.72, 0.65);
    eyeW.position.set(ex, ey, ez);
    head.add(eyeW);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.0072, 20, 14), M.iris);
    iris.scale.set(1, 1, 0.5);
    iris.position.set(ex, ey, ez + 0.0065);
    head.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0036, 14, 10), M.mouth);
    pupil.scale.set(1, 1, 0.5);
    pupil.position.set(ex, ey, ez + 0.0088);
    head.add(pupil);

    // Smooth curved eyelid covering the eye cleanly when closed
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.0142, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
      M.skin
    );
    lid.scale.set(1.16, 0.82, 0.76);
    lid.position.set(ex, ey, ez);
    lid.rotation.x = -0.25;
    head.add(lid);
    lids.push(lid);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0028, 0.026, 4, 10), M.hair);
    brow.scale.z = 0.55;
    brow.rotation.z = Math.PI / 2 - s * 0.05;
    brow.position.set(s * 0.035, 0.127, 0.093);
    head.add(brow);

    // Ears (elongated serene earlobes for adult Buddha/ascetic)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 20, 16), M.skin);
    ear.scale.set(0.32, longEars ? 1.45 : 0.95, 0.62);
    ear.position.set(s * 0.088, longEars ? 0.086 : 0.096, -0.004);
    head.add(ear);
  }

  // Serene gentle closed mouth (subtle curve, no bulbous lips)
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.016, 0.047, 0.092),
    new THREE.Vector3(-0.006, 0.044, 0.096),
    new THREE.Vector3(0.006, 0.044, 0.096),
    new THREE.Vector3(0.016, 0.047, 0.092),
  ]);
  const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 16, 0.0024, 8, false), M.lip);
  head.add(mouth);

  // Smooth fitted hair cap + optional ushnisha topknot
  const hairG = new THREE.SphereGeometry(0.109, 48, 28, 0, Math.PI * 2, 0, 1.42);
  const hp = hairG.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    hp.setXYZ(i, hp.getX(i) * (child ? 0.91 : 0.86), hp.getY(i) * (child ? 1.05 : 1.13), hp.getZ(i) * 0.97);
  }
  hairG.computeVertexNormals();
  const hair = new THREE.Mesh(hairG, M.hair);
  hair.position.set(0, 0.098, -0.002);
  hair.rotation.x = -0.14;
  head.add(hair);

  if (topknot) {
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.036, 28, 20), M.hair);
    knot.scale.set(1.0, 0.92, 1.0);
    knot.position.set(0, 0.215, -0.01);
    head.add(knot);
  }

  if (beard) {
    const bGeo = new THREE.SphereGeometry(0.072, 32, 20, 0, Math.PI * 2, 1.4, 1.4);
    const beardM = new THREE.Mesh(bGeo, M.beard);
    beardM.scale.set(0.95, 0.95, 0.95);
    beardM.position.set(0, 0.055, 0.025);
    head.add(beardM);
  }

  shadowAll(head);
  function setEyes(open = 1) {
    const k = Math.max(0, Math.min(1, open));
    const rx = 1.95 + (-0.25 - 1.95) * k;
    for (const lid of lids) lid.rotation.x = rx;
  }
  return { head, setMouth() {}, setEyes };
}

// Continuous sculpted torso + neck (waist -> ribcage -> shoulders -> neck)
function buildTorso(mat, { slender = false } = {}) {
  const s = slender ? 0.92 : 1.0;
  const profile = [
    [0.00, 0.145 * s],
    [0.07, 0.140 * s],
    [0.15, 0.132 * s],
    [0.24, 0.145 * s],
    [0.34, 0.162 * s],
    [0.42, 0.168 * s],
    [0.47, 0.145 * s],
    [0.50, 0.088],
    [0.53, 0.054],
    [0.62, 0.048],
  ];
  const curve = new THREE.SplineCurve(profile.map(([y, r]) => new THREE.Vector2(r, y)));
  const g = new THREE.LatheGeometry(curve.getPoints(36), 48);
  g.scale(1.14, 1, 0.68);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

// Flowing diagonal monastic robe (kasaya) with gentle cloth folds over left shoulder
function buildDrapedRobe(mat) {
  const g = new THREE.Group();
  const profile = [
    [-0.02, 0.175],
    [0.05, 0.156],
    [0.15, 0.146],
    [0.26, 0.158],
    [0.36, 0.174],
    [0.44, 0.176],
    [0.49, 0.138],
  ];
  const curve = new THREE.SplineCurve(profile.map(([y, r]) => new THREE.Vector2(r, y)));
  const geo = new THREE.LatheGeometry(curve.getPoints(32), 56);
  geo.scale(1.16, 1, 0.72);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // Diagonal neckline: covers left shoulder (x > 0) and dips under right arm (x < 0)
    const diagY = 0.34 + (x / 0.20) * 0.15;
    if (y > diagY && y > 0.24) {
      const pull = Math.min(1, (y - diagY) / 0.14);
      y = diagY + (y - diagY) * 0.15;
      x *= 1 - pull * 0.05;
    }
    // Soft cloth fold ripples
    const fold = Math.sin(x * 26 + y * 14) * 0.0045 + Math.cos(z * 22 - y * 10) * 0.003;
    const len = Math.hypot(x, z) || 1;
    p.setXYZ(i, x + (x / len) * fold, y, z + (z / len) * fold);
  }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, mat));

  // Draped shoulder shawl fold over left shoulder & arm
  const shawl = new THREE.Mesh(
    sweptTube([[0.06, 0.47, -0.05], [0.16, 0.45, 0.01], [0.19, 0.34, 0.04], [0.14, 0.22, 0.08]], [0.055, 0.068, 0.062, 0.048], { tubularSegs: 28, radialSegs: 18 }),
    mat
  );
  shawl.scale.set(1.0, 1.0, 0.85);
  g.add(shawl);
  return g;
}

export function makeHuman(outfit = 'monk', opts = {}) {
  const M = materials();
  const ascetic = outfit === 'ascetic';
  const monk = outfit === 'monk';
  const child = outfit === 'child';

  const root = new THREE.Group();
  if (opts.scale) root.scale.setScalar(opts.scale);

  // Subtle joint hierarchy preserved for breathing & gentle head movement
  const pelvis = new THREE.Group(); pelvis.position.y = 0.0; root.add(pelvis);
  const spine = new THREE.Group(); pelvis.add(spine);
  const chest = new THREE.Group(); chest.position.y = 0.22; spine.add(chest);
  const neck = new THREE.Group(); neck.position.y = 0.33; chest.add(neck);
  const j = { root, pelvis, spine, chest, neck };

  // Continuous torso (skin for ascetic/monk bare right shoulder; silk tunic for child)
  const torsoMat = child ? M.royalSilk : M.skin;
  const torso = buildTorso(torsoMat, { slender: ascetic });
  spine.add(torso);

  if (monk) {
    spine.add(buildDrapedRobe(M.robeSaffron));
  } else if (ascetic) {
    // Simple lower waist wrap in faded ascetic cloth
    const wrapG = new THREE.LatheGeometry([
      new THREE.Vector2(0.17, -0.02),
      new THREE.Vector2(0.155, 0.06),
      new THREE.Vector2(0.146, 0.14),
    ], 44);
    wrapG.scale(1.15, 1, 0.72);
    spine.add(new THREE.Mesh(wrapG, M.robeRags));
  }

  // Seamless cross-legged lotus base
  const legMat = ascetic ? M.robeRags : (monk ? M.robeSaffron : M.royalSilk);
  for (const s of [-1, 1]) {
    const legGeo = sweptTube(
      [[s * 0.09, 0.06, 0.02], [s * 0.25, 0.055, 0.12], [s * 0.16, 0.048, 0.23], [-s * 0.04, 0.042, 0.22]],
      [0.082, 0.072, 0.058, 0.042],
      { tubularSegs: 36, radialSegs: 20 }
    );
    pelvis.add(new THREE.Mesh(legGeo, legMat));
    // Bare foot tucked cleanly
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 18, 14), M.skin);
    foot.scale.set(1.25, 0.55, 0.85);
    foot.position.set(-s * 0.06, 0.038, 0.22);
    pelvis.add(foot);
  }

  // Seamless curved arms resting naturally into dhyana mudra in lap
  for (const s of [-1, 1]) {
    const armMat = (monk && s > 0) ? M.robeSaffron : M.skin;
    const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.056, 20, 16), armMat);
    deltoid.position.set(s * 0.155, 0.215, 0.0);
    chest.add(deltoid);
    const armGeo = sweptTube(
      [[s * 0.14, 0.215, 0.00], [s * 0.195, 0.13, 0.02], [s * 0.185, -0.01, 0.08], [s * 0.07, -0.07, 0.19]],
      [0.052, 0.046, 0.040, 0.032],
      { tubularSegs: 36, radialSegs: 18 }
    );
    chest.add(new THREE.Mesh(armGeo, armMat));
  }

  // Cupped hands resting one over the other in lap (dhyana mudra)
  for (const [yOff, zOff] of [[-0.072, 0.195], [-0.062, 0.195]]) {
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 14), M.skin);
    palm.scale.set(1.25, 0.36, 0.95);
    palm.position.set(0, yOff, zOff);
    chest.add(palm);
  }

  // Sculpted head
  const H = buildSculptedHead(M, {
    topknot: monk || ascetic,
    longEars: monk || ascetic,
    beard: ascetic,
    child,
  });
  H.head.position.y = 0.02;
  neck.add(H.head);
  j.head = H.head;

  shadowAll(root);

  const human = {
    root, j, armor: {}, setMouth: H.setMouth, setEyes: H.setEyes,
    setPose(p = {}) {
      for (const k of ['pelvis', 'spine', 'chest', 'neck', 'head']) {
        const v = p[k] || [0, 0, 0];
        j[k].rotation.set(v[0], v[1], v[2], 'YXZ');
      }
    },
  };
  human.setEyes(1);
  return human;
}
