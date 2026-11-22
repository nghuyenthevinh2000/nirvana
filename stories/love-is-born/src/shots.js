import * as THREE from 'three';
import { makeHuman } from './human.js';
import {
  roadAndGround, voidGate, deadLaptop, ruinedTower, crackedHeart,
  lotusThrone, personFigure, glowSprite, auraRings, sparks,
} from './props.js';
import { lerp, smooth, easeInOut, range, V, cam, place, shake } from './anim.js';

export const DURATION = 64.90;

export const CAPTIONS = [
  [0.00, 'Khi bước qua'],
  [0.45, 'cánh cổng của'],
  [1.12, 'hư vô'],
  [2.28, 'tôi thấy hàng'],
  [2.82, 'nghìn người nằm'],
  [3.60, 'la liệt hai'],
  [4.22, 'bên đường'],
  [4.91, 'Những nhân viên'],
  [6.28, 'mất việc ôm'],
  [7.15, 'chặt chiếc máy'],
  [7.65, 'tính tắt nguồn'],
  [9.01, 'Những giám đốc'],
  [9.96, 'vỡ nợ ôm'],
  [11.16, 'lấy một tòa'],
  [11.71, 'tháp đổ nát'],
  [12.76, 'Những gia đình'],
  [14.22, 'tan vỡ ôm'],
  [15.41, 'khư khư hình'],
  [16.20, 'tượng trái tim'],
  [17.04, 'rạn nứt'],
  [17.80, 'Không ai chịu'],
  [19.33, 'buông'],
  [20.22, 'Cũng chẳng ai'],
  [20.99, 'đứng dậy nổi'],
  [22.82, 'Ở cuối con'],
  [23.71, 'đường ấy'],
  [24.76, 'Đức Phật ngồi'],
  [25.52, 'tĩnh lặng trên'],
  [26.32, 'tòa hoa sen'],
  [27.95, 'Ngài nhìn tôi'],
  [29.04, 'và nói'],
  [30.16, '"Hãy tạo ra'],
  [31.34, 'tình yêu và'],
  [32.60, 'ý nghĩa'],
  [33.88, 'Tình yêu và'],
  [35.32, 'ý nghĩa được'],
  [36.29, 'sinh ra giữa'],
  [37.22, 'con và tạo'],
  [38.22, 'vật của con."'],
  [39.57, 'Nghe xong'],
  [41.34, 'tôi quay lưng'],
  [42.14, 'trở lại'],
  [42.90, 'Tôi cúi xuống'],
  [44.50, 'đặt viên đá'],
  [45.20, 'đầu tiên để'],
  [46.30, 'dựng một tòa'],
  [47.04, 'hoa sen mới'],
  [48.22, 'rồi kéo hàng'],
  [49.64, 'nghìn người nằm'],
  [50.44, 'hai bên vào'],
  [51.34, 'xây cùng'],
  [52.88, 'Từng người một'],
  [53.90, 'đặt lại gánh'],
  [54.53, 'nặng cũ'],
  [55.33, 'bước vào ghép'],
  [56.83, 'từng cánh sen'],
  [58.02, 'Tòa hoa sen'],
  [59.64, 'vẫn còn dang'],
  [60.32, 'dở'],
  [61.12, 'nhưng hơi ấm'],
  [62.11, 'đã bắt đầu'],
  [62.80, 'lan ra giữa'],
  [63.76, 'hư vô', 64.70],
];

export const FADES = [
  [0.0, 0.0, 0.0, 0.45],
  [22.55, 22.80, 22.85, 23.15],
  [39.30, 39.55, 39.60, 39.90],
  [64.40, 64.88, 65.50, 66.00],
];

function setSky(scene, top, mid, hor, fl) {
  const u = scene.userData.sky.material.uniforms;
  u.top.value.setHex(top); u.mid.value.setHex(mid); u.horizon.value.setHex(hor); u.floorC.value.setHex(fl);
}

function addFallenCrowd(scene, zStart = -2, zEnd = -32, step = 1.7) {
  const kinds = [deadLaptop, ruinedTower, crackedHeart];
  let idx = 0;
  for (let z = zStart; z >= zEnd; z -= step) {
    for (const s of [-1, 1]) {
      const p = personFigure({ robeColor: idx % 2 ? 0x2b303d : 0x393f4e });
      const sitting = idx % 2 === 0;
      if (sitting) p.poseSitting();
      else p.poseBack();
      p.position.set(s * (1.85 + (idx % 3) * 0.38), 0, z + (s > 0 ? 0.35 : -0.2));
      p.rotation.y = sitting
        ? -s * (Math.PI * 0.38 + ((idx % 4) - 1.5) * 0.12)
        : s * (Math.PI * 0.45 + ((idx % 5) - 2) * 0.08);
      const prop = kinds[idx % 3]();
      prop.rotation.x = sitting ? 0.15 : -0.15;
      p.hold(prop);
      scene.add(p);
      idx++;
    }
  }
}

// ============ SHOT 1 (0.00 - 4.91): Gate of the Void & Crowd ============
function shot1({ makeStage }) {
  const scene = makeStage({ shadowSize: 8, sunDir: [-2, 6, 5], sun: 1.5, fogColor: 0x10131e, fogDensity: 0.032 });
  setSky(scene, 0x060810, 0x111524, 0x23293e, 0x0b0d14);
  scene.add(roadAndGround());
  const gate = voidGate(); gate.position.set(0, 0, -2.5); scene.add(gate);
  addFallenCrowd(scene, -4.5, -26, 1.8);
  const beacon = glowSprite(0xffcb66, 2.2); beacon.position.set(0, 1.2, -32); scene.add(beacon);
  const c = cam(44);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 4.91));
      place(c, [0, lerp(1.9, 1.55, k), lerp(3.8, -5.2, k)], [0, lerp(2.1, 0.9, k), -18]);
      return { dof: { focus: 6.5, aperture: 0.0014, maxblur: 0.005 }, bloom: 0.35 };
    },
  };
}

// ============ SHOT 2 (4.91 - 9.01): Laid-off Workers & Dead Laptops ============
function shot2({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [-2, 5, 3], sun: 1.4, fogColor: 0x111522, fogDensity: 0.04 });
  setSky(scene, 0x070912, 0x121726, 0x242b40, 0x0c0e16);
  scene.add(roadAndGround());
  for (let i = 0; i < 4; i++) {
    const p = personFigure({ robeColor: 0x2c3240 });
    const sitting = i % 2 === 0;
    if (sitting) p.poseSitting();
    else p.poseBack();
    p.position.set(-1.75 - (i % 2) * 0.25, 0, -i * 1.45);
    p.rotation.y = sitting ? 0.85 : -1.15;
    const lap = deadLaptop();
    lap.rotation.set(sitting ? 0.15 : -0.15, 0.2, 0);
    p.hold(lap);
    scene.add(p);
  }
  const c = cam(44);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 4.1));
      const sh = shake(t, 0.4, 11);
      place(c, [lerp(0.75, 0.65, k) + sh[0], lerp(1.4, 1.15, k) + sh[1], lerp(1.5, -1.9, k)], [-1.85, 0.35, lerp(-0.3, -2.8, k)]);
      return { dof: { focus: 2.8, aperture: 0.0018, maxblur: 0.005 }, bloom: 0.25 };
    },
  };
}

// ============ SHOT 3 (9.01 - 12.76): Bankrupt CEOs & Ruined Towers ============
function shot3({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [2, 5, 3], sun: 1.4, fogColor: 0x111522, fogDensity: 0.04 });
  setSky(scene, 0x070912, 0x121726, 0x242b40, 0x0c0e16);
  scene.add(roadAndGround());
  for (let i = 0; i < 4; i++) {
    const p = personFigure({ robeColor: 0x232732 });
    const sitting = i % 2 === 1;
    if (sitting) p.poseSitting();
    else p.poseBack();
    p.position.set(1.75 + (i % 2) * 0.25, 0, -i * 1.5);
    p.rotation.y = sitting ? -0.85 : 1.15;
    const tw = ruinedTower();
    tw.rotation.set(sitting ? 0.1 : -0.1, 0, 0.2);
    tw.position.y = -0.15;
    p.hold(tw);
    scene.add(p);
  }
  const c = cam(40);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 3.75));
      place(c, [lerp(-0.35, -0.25, k), lerp(1.3, 1.05, k), lerp(1.3, -1.9, k)], [1.65, 0.35, lerp(-0.3, -2.7, k)]);
      return { dof: { focus: 2.4, aperture: 0.002, maxblur: 0.005 }, bloom: 0.25 };
    },
  };
}

// ============ SHOT 4 (12.76 - 17.80): Broken Families & Cracked Hearts ============
function shot4({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [-2, 5, 3], sun: 1.4, fogColor: 0x121422, fogDensity: 0.04 });
  setSky(scene, 0x080a14, 0x141828, 0x2a273d, 0x0d0e16);
  scene.add(roadAndGround());
  for (let i = 0; i < 4; i++) {
    const p = personFigure({ robeColor: 0x3b3544 });
    const sitting = i % 2 === 0;
    if (sitting) p.poseSitting();
    else p.poseBack();
    p.position.set(-1.65 - (i % 2) * 0.25, 0, -i * 1.4);
    p.rotation.y = sitting ? 0.85 : -1.15;
    const ht = crackedHeart();
    ht.rotation.set(sitting ? 0.1 : -0.1, 0, 0);
    p.hold(ht);
    scene.add(p);
  }
  const c = cam(44);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 5.04));
      place(c, [0.7, lerp(1.38, 1.15, k), lerp(1.4, -2.0, k)], [-1.75, 0.35, lerp(-0.3, -2.9, k)]);
      return { dof: { focus: 2.8, aperture: 0.0018, maxblur: 0.005 }, bloom: 0.28 };
    },
  };
}

// ============ SHOT 5 (17.80 - 22.82): Nobody Lets Go / Nobody Stands ============
function shot5({ makeStage }) {
  const scene = makeStage({ shadowSize: 8, sunDir: [0, 6, -4], sun: 1.5, fogColor: 0x121624, fogDensity: 0.03 });
  setSky(scene, 0x070a14, 0x13192b, 0x2c344c, 0x0d1018);
  scene.add(roadAndGround());
  addFallenCrowd(scene, 0, -24, 1.7);
  const beacon = glowSprite(0xffd26a, 3.2); beacon.position.set(0, 1.1, -28); scene.add(beacon);
  const c = cam(42);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 5.02));
      place(c, [0, lerp(0.55, 1.35, k), lerp(1.5, -6.5, k)], [0, 0.75, -26]);
      return { dof: { focus: 5.5, aperture: 0.0016, maxblur: 0.005 }, bloom: 0.45 };
    },
  };
}

// ============ SHOT 6 (22.82 - 39.57): Buddha on Lotus & His Teaching ============
function shot6({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.5, sunDir: [-2, 5, 4], sun: 2.3, fogColor: 0x1a1e2e, fogDensity: 0.022 });
  setSky(scene, 0x0b1224, 0x1b2b4a, 0x4b5c7a, 0x151b2a);
  scene.add(roadAndGround());
  const throne = lotusThrone({ radius: 0.95, petalCount: 14, glowing: true });
  throne.position.set(0, 0, 0); scene.add(throne);
  const buddha = makeHuman('monk');
  buddha.root.position.set(0, 0.24, 0); scene.add(buddha.root);
  const aura = auraRings(4, 0xffd166); aura.position.set(0, 0.1, 0); scene.add(aura);
  const halo = glowSprite(0xffda75, 1.6); halo.position.set(0, 0.95, -0.25); scene.add(halo);
  const motes = sparks(90, { speed: 0.18, spread: 1.4, gravity: 0.08, life: 4.5, size: 0.015, seed: 23, color: [1, 0.88, 0.48] });
  motes.position.set(0, 0.25, 0); scene.add(motes);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t) {
      const breath = Math.sin(t * 1.1) * 0.015;
      buddha.setPose({ spine: [breath, 0, 0], head: [-0.03, Math.sin(t * 0.4) * 0.03, 0] });
      buddha.setEyes(smooth(range(t, 4.5, 5.8)));
      aura.update(t);
      motes.update(t);
      const pulse = 1 + 0.15 * Math.sin(t * 1.8) * smooth(range(t, 7.0, 9.0));
      halo.scale.setScalar(1.5 * pulse);
      const k = easeInOut(range(t, 0, 16.75));
      const a = lerp(-0.28, 0.26, k);
      const r = lerp(3.1, 2.35, k);
      place(c, [Math.sin(a) * r, lerp(1.05, 1.18, k), Math.cos(a) * r], [0, 0.78, 0]);
      return { dof: { focus: r, aperture: 0.0022, maxblur: 0.005 }, bloom: 0.65 + 0.25 * smooth(range(t, 7, 13)) };
    },
  };
}

// ============ SHOT 7 (39.57 - 52.88): Turn Back, Lay First Stone & Pull People Up ============
function shot7({ makeStage }) {
  const scene = makeStage({ shadowSize: 5.5, sunDir: [-2, 6, 4], sun: 2.0, fogColor: 0x161b28, fogDensity: 0.025 });
  setSky(scene, 0x0b1224, 0x1e2c48, 0x4d556c, 0x141824);
  scene.add(roadAndGround());
  addFallenCrowd(scene, -2.5, -14, 2.0);

  const newLotus = lotusThrone({ radius: 1.1, petalCount: 16, glowing: false });
  newLotus.position.set(0, 0, -1.8); scene.add(newLotus);

  const narrator = personFigure({ robeColor: 0xe6a64d, scale: 1.04 });
  scene.add(narrator);
  const helper1 = personFigure({ robeColor: 0x3b4459 });
  scene.add(helper1);
  const helper2 = personFigure({ robeColor: 0x454a5e });
  scene.add(helper2);

  const warmGlow = glowSprite(0xffb84d, 1.4); warmGlow.position.set(0, 0.3, -1.8); scene.add(warmGlow);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t) {
      const buildP = smooth(range(t, 3.2, 13.0)) * 0.35;
      newLotus.setProgress(buildP);
      warmGlow.material.opacity = 0.2 + buildP * 1.4;

      // Narrator walks toward center, kneels to place first stone, then pulls others up
      if (t < 3.2) {
        narrator.position.set(0, 0, lerp(0.5, -1.0, smooth(range(t, 0, 3.0))));
        narrator.rotation.y = Math.PI;
        narrator.poseWalk(t * 4.5);
      } else if (t < 7.2) {
        narrator.position.set(0, 0, -1.0);
        narrator.rotation.y = Math.PI;
        narrator.poseBuild(t * 3.0);
      } else {
        const pull = smooth(range(t, 7.2, 11.5));
        narrator.position.set(lerp(0, -0.7, pull), 0, lerp(-1.0, -2.1, pull));
        narrator.rotation.y = lerp(Math.PI, -Math.PI * 0.4, pull);
        narrator.poseWalk(t * 3.5);
      }

      // Two fallen figures rise up and step toward the lotus
      const r1 = smooth(range(t, 7.5, 11.2));
      if (r1 < 0.2) helper1.poseLying();
      else helper1.poseWalk(t * 4.0);
      helper1.position.set(lerp(-1.85, -0.95, r1), 0, lerp(-2.6, -2.0, r1));
      helper1.rotation.y = lerp(-1.4, 1.2, r1);

      const r2 = smooth(range(t, 8.8, 12.6));
      if (r2 < 0.2) helper2.poseLying();
      else helper2.poseWalk(t * 3.8);
      helper2.position.set(lerp(1.85, 0.95, r2), 0, lerp(-3.0, -2.1, r2));
      helper2.rotation.y = lerp(1.4, -1.2, r2);

      const k = easeInOut(range(t, 0, 13.31));
      place(c, [lerp(0.6, -1.5, k), lerp(1.4, 1.35, k), lerp(1.8, -0.2, k)], [0, 0.65, -1.9]);
      return { dof: { focus: 3.0, aperture: 0.0018, maxblur: 0.005 }, bloom: 0.55 };
    },
  };
}

// ============ SHOT 8 (52.88 - 64.90): Building the Unfinished Lotus Together ============
function shot8({ makeStage }) {
  const scene = makeStage({ shadowSize: 7.5, sunDir: [-3, 5, 4], sun: 2.5, fogColor: 0x242636, fogDensity: 0.018 });
  setSky(scene, 0x101830, 0x2c4268, 0x8f6b56, 0x2c2224);
  scene.add(roadAndGround());

  // Discarded old relics left behind on both sides
  for (let i = 0; i < 6; i++) {
    const s = i % 2 === 0 ? -1 : 1;
    const prop = [deadLaptop, ruinedTower, crackedHeart][i % 3]();
    prop.position.set(s * (2.3 + (i % 3) * 0.4), 0.05, -1.0 - i * 1.1);
    scene.add(prop);
  }

  // Unfinished glowing lotus in the center (progress reaches ~0.68, still being built!)
  const lotus = lotusThrone({ radius: 1.35, petalCount: 18, glowing: true });
  lotus.position.set(0, 0, -2.0); scene.add(lotus);

  const builders = [];
  const colors = [0xe6a64d, 0x5c6b8a, 0x7b88a1, 0x8c7060, 0x4f5d75, 0x99805b, 0x5c6b8a, 0x6e7b94];
  for (let i = 0; i < 8; i++) {
    const a = lerp(-Math.PI * 0.92, -Math.PI * 0.08, i / 7);
    const b = personFigure({ robeColor: colors[i] });
    b.position.set(Math.cos(a) * 1.75, 0, -2.0 + Math.sin(a) * 1.75);
    b.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    scene.add(b);
    builders.push(b);
  }

  const warmGlow = glowSprite(0xffcb5c, 2.6); warmGlow.position.set(0, 0.55, -2.0); scene.add(warmGlow);
  const motes = sparks(120, { speed: 0.24, spread: 1.8, gravity: 0.12, life: 4.2, size: 0.016, seed: 88, color: [1, 0.85, 0.42] });
  motes.position.set(0, 0.25, -2.0); scene.add(motes);
  const c = cam(42);
  return {
    scene, camera: c,
    update(t) {
      const k = easeInOut(range(t, 0, 12.0));
      // Unfinished lotus: grows from 35% to 68% while people actively build it
      lotus.setProgress(0.35 + k * 0.33);
      builders.forEach((b, i) => b.poseBuild(t * 2.8 + i * 0.9));
      motes.update(t);

      // Warm dawn spreads across the void sky
      const u = scene.userData.sky.material.uniforms;
      u.top.value.setHex(0x101830).lerp(new THREE.Color(0x1f3a66), k);
      u.mid.value.setHex(0x2c4268).lerp(new THREE.Color(0x5b6c94), k);
      u.horizon.value.setHex(0x8f6b56).lerp(new THREE.Color(0xf0b26b), k);
      warmGlow.scale.setScalar(2.2 + k * 1.3);

      const ang = lerp(-0.35, 0.45, k);
      const dist = lerp(3.4, 5.8, k);
      place(c, [Math.sin(ang) * dist, lerp(1.35, 2.35, k), -2.0 + Math.cos(ang) * dist], [0, 0.5, -2.0]);
      return { dof: { focus: dist, aperture: 0.0018, maxblur: 0.005 }, bloom: 0.65 + k * 0.45 };
    },
  };
}

export const SHOTS = [
  { start: 0.00, end: 4.91, build: shot1 },
  { start: 4.91, end: 9.01, build: shot2 },
  { start: 9.01, end: 12.76, build: shot3 },
  { start: 12.76, end: 17.80, build: shot4 },
  { start: 17.80, end: 22.82, build: shot5 },
  { start: 22.82, end: 39.57, build: shot6 },
  { start: 39.57, end: 52.88, build: shot7 },
  { start: 52.88, end: 64.90, build: shot8 },
];
