import * as THREE from 'three';
import { makeHuman } from './human.js';
import {
  tree, groundDisc, almsBowl, riceBowl, walkingCompanions,
  jhanaLayers, pastLivesStream, fourTruthsLotus,
  glowSprite, sparks, auraRings, rippleOverlay,
} from './props.js';
import { lerp, smooth, easeInOut, range, V, cam, place, shake } from './anim.js';

export const DURATION = 90.58;

// [start, text, end?] — synced to ElevenLabs Vietnamese voiceover (UsgbMVmY3U59ijwK5mdh)
export const CAPTIONS = [
  [0.00, 'Nếu bạn nhịn'],
  [0.64, 'ăn đến kiệt'],
  [1.35, 'sức'],
  [2.14, 'liệu có chạm'],
  [2.86, 'tới giác ngộ?'],
  [4.11, 'Suốt sáu năm'],
  [6.43, 'Thái tử Tất-đạt-đa'],
  [7.55, 'ép xác khổ'],
  [8.28, 'hạnh dưới nắng'],
  [9.12, 'gió'],
  [9.67, 'Nhưng thân xác'],
  [11.02, 'chỉ còn da'],
  [11.64, 'bọc xương'],
  [12.85, 'mà tâm vẫn'],
  [13.57, 'chưa thấy đường'],
  [14.32, 'ra'],
  [14.80, 'Nhưng rồi'],
  [16.53, 'ngồi dưới gốc'],
  [17.50, 'cây'],
  [18.61, 'Ngài chợt nhớ'],
  [19.36, 'về năm lên'],
  [20.00, 'sáu tuổi'],
  [21.15, 'Ngồi yên dưới'],
  [22.11, 'bóng mát cây'],
  [22.69, 'hồng táo'],
  [23.58, 'tâm tự nhiên'],
  [24.84, 'tĩnh lặng'],
  [25.54, 'nhẹ nhàng và'],
  [27.23, 'tràn đầy hỷ'],
  [28.25, 'lạc'],
  [28.88, 'Và Ngài bừng'],
  [30.21, 'tỉnh nhận ra'],
  [31.20, 'Không phải hành'],
  [32.56, 'xác'],
  [33.01, 'Chính sự tĩnh'],
  [34.16, 'lặng này mới'],
  [35.25, 'là con đường'],
  [35.89, 'giác ngộ'],
  [36.96, 'Ngài hiểu thân'],
  [38.84, 'thể kiệt quệ'],
  [39.64, 'không thể giữ'],
  [40.35, 'định tĩnh'],
  [41.58, 'nên quyết định'],
  [42.13, 'ăn cơm trở'],
  [42.86, 'lại'],
  [43.42, 'Năm người bạn'],
  [44.77, 'đồng tu thấy'],
  [45.52, 'vậy liền chán'],
  [46.52, 'nản'],
  [47.23, 'quay lưng bỏ'],
  [47.92, 'đi'],
  [48.92, 'cho rằng Ngài'],
  [49.73, 'đã từ bỏ'],
  [50.32, 'đạo'],
  [50.98, 'Một mình dưới'],
  [52.56, 'cội Bồ-đề'],
  [53.82, 'khi sức lực'],
  [54.46, 'hồi phục'],
  [55.65, 'Ngài bước vào'],
  [56.38, 'bốn tầng thiền'],
  [57.15, 'định'],
  [57.79, 'từ hỷ lạc'],
  [59.08, 'ban đầu'],
  [60.00, 'lắng dịu suy'],
  [60.99, 'tư'],
  [61.48, 'đến trạng thái'],
  [62.84, 'xả niệm thanh'],
  [63.68, 'tịnh hoàn toàn'],
  [65.24, 'Đêm ấy'],
  [66.86, 'tâm sáng rực'],
  [67.66, 'qua ba canh'],
  [68.78, 'Canh một'],
  [70.67, 'thấy suốt vô'],
  [71.47, 'số kiếp quá'],
  [72.16, 'khứ'],
  [72.90, 'Canh hai'],
  [74.35, 'thấu rõ quy'],
  [75.55, 'luật nhân quả'],
  [76.30, 'sinh tử của'],
  [77.16, 'chúng sinh'],
  [78.02, 'Canh cuối'],
  [79.79, 'thấu triệt Tứ'],
  [81.04, 'Diệu Đế và'],
  [82.22, 'đoạn tận mọi'],
  [83.16, 'lậu hoặc'],
  [84.36, 'Ánh sáng bừng'],
  [85.82, 'lên'],
  [86.30, 'sinh đã diệt'],
  [88.06, 'tâm hoàn toàn'],
  [89.42, 'giải thoát', 90.38],
];

// Dip to black on the "Nhưng rồi" turn (14.55 - 15.05) and Nightfall (65.00 - 65.45)
export const FADES = [
  [14.55, 14.70, 14.85, 15.05],
  [64.95, 65.12, 65.25, 65.45],
];

function breath(t, k = 1) { return Math.sin(t * 1.4) * 0.014 * k; }

function sitPose(h, t, extra = {}) {
  const p = { ...extra };
  p.chest = [breath(t) + (extra.chest?.[0] || 0), extra.chest?.[1] || 0, extra.chest?.[2] || 0];
  h.setPose(p);
}

function setSky(scene, top, mid, horizon, floorC) {
  const u = scene.userData.sky.material.uniforms;
  u.top.value.set(top); u.mid.value.set(mid); u.horizon.value.set(horizon); u.floorC.value.set(floorC);
}

// ============ SHOT 1: Hook — ascetic under harsh sun ============
function shot1({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [2, 7, 3], sun: 2.8 });
  setSky(scene, 0xd49b5a, 0xe8bc7a, 0xf5dcb0, 0xd8be94);
  scene.add(groundDisc(12, 'earth'));
  const t1 = tree({ height: 2.8, crownScale: 0.95, dry: true });
  t1.position.set(0, 0, -0.72); scene.add(t1);
  const man = makeHuman('ascetic'); man.root.position.set(0, 0, 0.08); scene.add(man.root);
  const bowl = almsBowl(); bowl.position.set(0.45, 0, 0.35); scene.add(bowl);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t) {
      sitPose(man, t, { spine: [0.14, 0, 0], neck: [0.16, 0, 0], head: [0.12, 0, 0] });
      man.setEyes(0);
      const k = easeInOut(range(t, 0, 4.1));
      const s = shake(t, 0.35);
      place(c, [lerp(-0.45, 0.1, k) + s[0], lerp(0.75, 0.72, k) + s[1], lerp(2.15, 1.65, k)], [0, 0.45, 0.05]);
      return { dof: { focus: c.position.distanceTo(V(0, 0.55, 0.08)), aperture: 0.003, maxblur: 0.007 }, bloom: 0.35 };
    },
  };
}

// ============ SHOT 2: Six years of austerity in wind & sun ============
function shot2({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.5, sunDir: [3, 6, 2], sun: 2.7 });
  setSky(scene, 0xc88848, 0xe2b070, 0xf2d4a4, 0xd0b084);
  scene.add(groundDisc(12, 'earth'));
  const t1 = tree({ height: 2.8, crownScale: 0.95, dry: true });
  t1.position.set(0, 0, -0.75); scene.add(t1);
  const man = makeHuman('ascetic'); man.root.position.set(0, 0, 0.08); scene.add(man.root);
  const dust = sparks(90, { speed: 0.45, spread: 0.6, gravity: 0.02, life: 3.0, size: 0.005, dir: V(1, 0.15, 0.2).normalize(), seed: 7, color: [0.95, 0.78, 0.52] });
  dust.position.set(-1.5, 0.5, 0.2); scene.add(dust);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      sitPose(man, t * 1.3, { spine: [0.18, 0, 0], neck: [0.18, 0, 0], head: [0.14, 0, 0] });
      man.setEyes(0);
      dust.update(t + 1.2);
      const a = lerp(-0.55, 0.55, easeInOut(range(t, 0, 5.5)));
      const r = lerp(2.7, 2.25, range(t, 0, 5.5));
      place(c, [Math.sin(a) * r, 0.85, Math.cos(a) * r], [0, 0.52, -0.1]);
      return { dof: { focus: r, aperture: 0.0025, maxblur: 0.006 }, bloom: 0.3 };
    },
  };
}

// ============ SHOT 3: Exhaustion — skin & bone, no way out ============
function shot3({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.0, sunDir: [-2, 5, 3], sun: 1.9 });
  setSky(scene, 0x7c5848, 0xa87860, 0xc89a7a, 0x8a6c58);
  scene.add(groundDisc(12, 'earth'));
  const t1 = tree({ height: 2.8, crownScale: 0.95, dry: true });
  t1.position.set(0, 0, -0.75); scene.add(t1);
  const man = makeHuman('ascetic'); man.root.position.set(0, 0, 0.08); scene.add(man.root);
  const disc = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 24), new THREE.MeshBasicMaterial({ visible: false }));
  disc.position.set(0, 0.38, 0.14); scene.add(disc);
  const rip = rippleOverlay(disc);
  const c = cam(32);
  return {
    scene, camera: c,
    update(t) {
      sitPose(man, t * 1.4, { spine: [0.20, 0, 0], neck: [0.20, 0, 0], head: [0.16, 0, 0] });
      man.setEyes(0);
      rip.material.uniforms.uTime.value = t;
      rip.material.uniforms.uRadius.value = 0.02 + range(t, 0.5, 4.5) * 0.25;
      rip.material.uniforms.uAmp.value = 0.55 * Math.sin(range(t, 0.4, 4.8) * Math.PI);
      const s = shake(t, 0.45);
      place(c, [0.15 + s[0], 0.68 + s[1], lerp(1.55, 1.32, range(t, 0, 5.1))], [0, 0.48, 0.08]);
      return { dof: { focus: 1.35, aperture: 0.004, maxblur: 0.009 }, bloom: 0.25 };
    },
  };
}

// ============ SHOT 4: Under the Bodhi tree — memory sparks ============
function shot4({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.0, sunDir: [-3, 6, 4], sun: 2.1 });
  setSky(scene, 0x204a78, 0x457cb2, 0x8cb8e0, 0x5c7c9c);
  scene.add(groundDisc(12, 'grass'));
  const t1 = tree({ height: 2.7, crownScale: 1.15, dry: false });
  t1.position.set(0, 0, -0.78); scene.add(t1);
  const man = makeHuman('monk'); man.root.position.set(0, 0, 0.08); scene.add(man.root);
  const spark = glowSprite(0xffd260, 0.15); spark.position.set(0, 0.68, 0.22); scene.add(spark);
  const motes = sparks(80, { speed: 0.18, spread: 1.4, gravity: 0.08, life: 3.5, size: 0.007, dir: V(0, 1, 0), seed: 11, color: [1, 0.85, 0.4] });
  motes.position.set(0, 0.25, 0.1); scene.add(motes);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t) {
      const lift = smooth(range(t, 0.8, 3.6));
      sitPose(man, t, { spine: [lerp(0.1, 0.0, lift), 0, 0], neck: [lerp(0.12, 0.0, lift), 0, 0], head: [lerp(0.08, -0.04, lift), 0, 0] });
      man.setEyes(0);
      const gl = smooth(range(t, 1.8, 4.5));
      spark.scale.setScalar(0.05 + gl * 0.4);
      spark.material.opacity = gl * 0.6;
      motes.update(t);
      place(c, [lerp(-0.4, 0.0, range(t, 0, 6.2)), 0.72, lerp(2.2, 1.65, range(t, 0, 6.2))], [0, 0.48, 0.05]);
      return { dof: { focus: 1.7, aperture: 0.003, maxblur: 0.007 }, bloom: 0.45 + gl * 0.4 };
    },
  };
}

// ============ SHOT 5: Age 6 under the Rose-Apple (Jambu) tree ============
function shot5({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.0, sunDir: [3, 7, 3], sun: 2.5 });
  setSky(scene, 0x3b86d6, 0x6cb2f0, 0xb2dcfa, 0x9ac6e8);
  scene.add(groundDisc(12, 'grass'));
  const jambu = tree({ height: 2.15, crownScale: 1.05, dry: false, fruit: true });
  jambu.position.set(0, 0, -0.68); scene.add(jambu);
  const boy = makeHuman('child', { scale: 0.62 });
  boy.root.position.set(0, 0, 0.08); scene.add(boy.root);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      sitPose(boy, t * 0.9, { spine: [0, 0, 0], head: [-0.02, 0, 0] });
      boy.setEyes(0);
      const k = easeInOut(range(t, 0, 3.69));
      place(c, [lerp(0.75, -0.2, k), lerp(0.72, 0.62, k), lerp(2.55, 2.05, k)], [0, 0.44, 0.0]);
      return { dof: { focus: 2.1, aperture: 0.0025, maxblur: 0.006 }, bloom: 0.4 };
    },
  };
}

// ============ SHOT 6: Natural stillness & joy (Hỷ lạc) ============
function shot6({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [-2, 6, 4], sun: 2.4 });
  setSky(scene, 0x458cd8, 0x7cbcf2, 0xc2e4fc, 0xaad4f0);
  scene.add(groundDisc(12, 'grass'));
  const jambu = tree({ height: 2.15, crownScale: 1.05, dry: false, fruit: true });
  jambu.position.set(0, 0, -0.68); scene.add(jambu);
  const boy = makeHuman('child', { scale: 0.62 });
  boy.root.position.set(0, 0, 0.08); scene.add(boy.root);
  const aura = auraRings(4); aura.position.set(0, 0.01, 0.08); scene.add(aura);
  const motes = sparks(100, { speed: 0.22, spread: 1.1, gravity: 0.09, life: 3.2, size: 0.006, dir: V(0, 1, 0), seed: 23, color: [1, 0.92, 0.55] });
  motes.position.set(0, 0.2, 0.08); scene.add(motes);
  const c = cam(32);
  return {
    scene, camera: c,
    update(t) {
      sitPose(boy, t * 0.85, { head: [-0.03, 0, 0] });
      boy.setEyes(0);
      aura.update(t);
      motes.update(t + 0.5);
      const a = lerp(-0.25, 0.35, easeInOut(range(t, 0, 4.0)));
      place(c, [Math.sin(a) * 1.45, 0.54, Math.cos(a) * 1.45], [0, 0.32, 0.08]);
      return { dof: { focus: 1.45, aperture: 0.003, maxblur: 0.007 }, bloom: 0.65 };
    },
  };
}

// ============ SHOT 7: Realization — stillness is the path ============
function shot7({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.5, sunDir: [-3, 5, 4], sun: 2.6 });
  setSky(scene, 0x265a96, 0x5c96cc, 0xf2c888, 0xd4b27c);
  scene.add(groundDisc(14, 'grass'));
  const bodhi = tree({ height: 2.7, crownScale: 1.15, dry: false });
  bodhi.position.set(0, 0, -0.78); scene.add(bodhi);
  const buddha = makeHuman('monk'); buddha.root.position.set(0, 0, 0.08); scene.add(buddha.root);
  const aura = auraRings(5); aura.position.set(0, 0.01, 0.08); scene.add(aura);
  const halo = glowSprite(0xffcf56, 0.55); halo.position.set(0, 0.68, -0.16); scene.add(halo);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      sitPose(buddha, t * 0.75, { head: [-0.03, 0, 0] });
      buddha.setEyes(smooth(range(t, 0.6, 1.5)));
      aura.update(t + 1.0);
      const glowK = smooth(range(t, 0.4, 3.0));
      halo.scale.setScalar(0.45 + glowK * 0.55);
      halo.material.opacity = 0.2 + glowK * 0.35;
      const k = easeInOut(range(t, 0, 8.0));
      place(c, [lerp(0.25, 0.0, k), lerp(0.78, 1.05, k), lerp(2.15, 3.25, k)], [0, lerp(0.50, 0.65, k), 0]);
      return { dof: { focus: c.position.distanceTo(V(0, 0.55, 0.08)), aperture: 0.0022, maxblur: 0.005 }, bloom: 0.5 + glowK * 0.4 };
    },
  };
}

// ============ SHOT 8 (SC 54-55a): Challenge — eating rice to restore strength ============
function shot8({ makeStage }) {
  const scene = makeStage({ shadowSize: 3.5, sunDir: [3, 6, 4], sun: 2.5 });
  setSky(scene, 0x3b78b8, 0x72a8dc, 0xc8dff4, 0xa8c4dc);
  scene.add(groundDisc(12, 'grass'));
  const bodhi = tree({ height: 2.7, crownScale: 1.1, dry: false });
  bodhi.position.set(0, 0, -0.78); scene.add(bodhi);
  const man = makeHuman('ascetic'); man.root.position.set(0, 0, 0.08); scene.add(man.root);
  const bowl = riceBowl(); bowl.position.set(0, 0, 0.52); scene.add(bowl);
  const steam = sparks(45, { speed: 0.14, spread: 0.35, gravity: 0.04, life: 2.2, size: 0.008, dir: V(0, 1, 0), seed: 41, color: [1, 0.96, 0.88] });
  steam.position.set(0, 0.12, 0.52); scene.add(steam);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t) {
      sitPose(man, t, { spine: [0.06, 0, 0], head: [0.16, 0, 0] });
      man.setEyes(1);
      steam.update(t);
      const k = easeInOut(range(t, 0, 6.46));
      place(c, [lerp(-0.35, 0.25, k), lerp(0.58, 0.68, k), lerp(1.85, 2.15, k)], [0, lerp(0.32, 0.42, k), 0.25]);
      return { dof: { focus: 1.4, aperture: 0.003, maxblur: 0.007 }, bloom: 0.35 };
    },
  };
}

// ============ SHOT 9 (SC 55b): Challenge — 5 companions turn away & leave ============
function shot9({ makeStage }) {
  const scene = makeStage({ shadowSize: 5.5, sunDir: [-3, 5, 3], sun: 2.1 });
  setSky(scene, 0x4c6278, 0x7a90a6, 0xb8c6d4, 0x8ea0b2);
  scene.add(groundDisc(16, 'grass'));
  const bodhi = tree({ height: 2.8, crownScale: 1.15, dry: false });
  bodhi.position.set(0, 0, -0.82); scene.add(bodhi);
  const man = makeHuman('monk'); man.root.position.set(0, 0, 0.15); scene.add(man.root);
  const companions = walkingCompanions(5); companions.position.set(0, 0, -1.35); scene.add(companions);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t) {
      sitPose(man, t, { head: [0.0, 0, 0] });
      man.setEyes(0);
      companions.update(t);
      const k = easeInOut(range(t, 0, 7.56));
      place(c, [lerp(0.65, 1.05, k), lerp(0.95, 1.35, k), lerp(2.55, 3.25, k)], [0, 0.65, -1.1]);
      return { dof: { focus: 3.2, aperture: 0.002, maxblur: 0.005 }, bloom: 0.25 };
    },
  };
}

// ============ SHOT 10 (SC 56-59): Concept — The Four Jhānas ============
function shot10({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.5, sunDir: [0, 7, 3], sun: 2.3 });
  setSky(scene, 0x163866, 0x2e64a2, 0x6ba2d6, 0x3b6896);
  scene.add(groundDisc(14, 'grass'));
  const bodhi = tree({ height: 2.7, crownScale: 1.15, dry: false });
  bodhi.position.set(0, 0, -0.78); scene.add(bodhi);
  const buddha = makeHuman('monk'); buddha.root.position.set(0, 0, 0.08); scene.add(buddha.root);
  const layers = jhanaLayers(); layers.position.set(0, 0, 0.08); scene.add(layers);
  const motes = sparks(110, { speed: 0.14, spread: 1.2, gravity: 0.08, life: 4.0, size: 0.006, dir: V(0, 1, 0), seed: 53, color: [0.85, 0.94, 1.0] });
  motes.position.set(0, 0.2, 0.08); scene.add(motes);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      sitPose(buddha, t * 0.6);
      buddha.setEyes(0);
      const p = range(t, 0.8, 13.5);
      layers.update(t, p);
      motes.update(t);
      const a = lerp(-0.35, 0.35, easeInOut(range(t, 0, 14.2)));
      const r = lerp(2.45, 2.75, range(t, 0, 14.2));
      place(c, [Math.sin(a) * r, lerp(0.85, 1.15, p), Math.cos(a) * r], [0, 0.55, 0.05]);
      return { dof: { focus: r, aperture: 0.0022, maxblur: 0.005 }, bloom: 0.5 + p * 0.5 };
    },
  };
}

// ============ SHOT 11 (SC 60-61): Night Watches 1 & 2 — Past Lives & Kamma ============
function shot11({ makeStage }) {
  const scene = makeStage({ shadowSize: 4.5, sunDir: [0, 8, 2], sun: 1.4 });
  setSky(scene, 0x050b1c, 0x0d1b3a, 0x1a3058, 0x0c162c);
  scene.add(groundDisc(14, 'grass'));
  const bodhi = tree({ height: 2.7, crownScale: 1.15, dry: false });
  bodhi.position.set(0, 0, -0.78); scene.add(bodhi);
  const buddha = makeHuman('monk'); buddha.root.position.set(0, 0, 0.08); scene.add(buddha.root);
  const past = pastLivesStream(28); past.position.set(0, 0, 0.08); scene.add(past);
  const rise = sparks(100, { speed: 0.35, spread: 1.4, gravity: 0.12, life: 3.5, size: 0.008, dir: V(0, 1, 0), seed: 61, color: [1.0, 0.86, 0.35] });
  rise.position.set(0, 0.15, 0.08); scene.add(rise);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t) {
      sitPose(buddha, t * 0.6);
      buddha.setEyes(0);
      past.update(t);
      rise.update(t + 1.0);
      const k = easeInOut(range(t, 0, 12.78));
      const a = lerp(-0.5, 0.6, k);
      place(c, [Math.sin(a) * 2.8, lerp(1.05, 1.25, k), Math.cos(a) * 2.8], [0, 0.65, 0.0]);
      return { dof: { focus: 2.8, aperture: 0.002, maxblur: 0.005 }, bloom: 0.85 };
    },
  };
}

// ============ SHOT 12 (SC 62): Watch 3 & Full Awakening at Dawn ============
function shot12({ makeStage }) {
  const scene = makeStage({ shadowSize: 5.0, sunDir: [-2, 4, 4], sun: 2.8 });
  setSky(scene, 0x12264a, 0x3b6ba0, 0xf2b866, 0xd49a52);
  scene.add(groundDisc(16, 'grass'));
  const bodhi = tree({ height: 2.8, crownScale: 1.2, dry: false });
  bodhi.position.set(0, 0, -0.78); scene.add(bodhi);
  const buddha = makeHuman('monk'); buddha.root.position.set(0, 0, 0.08); scene.add(buddha.root);
  const truths = fourTruthsLotus(); truths.position.set(0, 0, 0.08); scene.add(truths);
  const aura = auraRings(5); aura.position.set(0, 0.01, 0.08); scene.add(aura);
  const halo = glowSprite(0xffd866, 0.75); halo.position.set(0, 0.68, -0.16); scene.add(halo);
  const motes = sparks(150, { speed: 0.26, spread: 1.6, gravity: 0.12, life: 4.5, size: 0.008, dir: V(0, 1, 0), seed: 71, color: [1.0, 0.92, 0.5] });
  motes.position.set(0, 0.25, 0.08); scene.add(motes);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      sitPose(buddha, t * 0.6, { head: [-0.03, 0, 0] });
      const dawn = smooth(range(t, 4.5, 9.5));
      buddha.setEyes(smooth(range(t, 6.0, 7.2)));
      // Sky shifts from pre-dawn indigo to radiant golden morning
      const u = scene.userData.sky.material.uniforms;
      u.top.value.setHex(0x12264a).lerp(new THREE.Color(0x2b74be), dawn);
      u.mid.value.setHex(0x3b6ba0).lerp(new THREE.Color(0x6daee6), dawn);
      u.horizon.value.setHex(0xf2b866).lerp(new THREE.Color(0xffe29a), dawn);
      truths.update(t, smooth(range(t, 0.5, 4.5)));
      aura.update(t + 1.0);
      motes.update(t + 1.0);
      halo.scale.setScalar(0.55 + dawn * 0.85);
      halo.material.opacity = 0.25 + dawn * 0.45;
      const k = easeInOut(range(t, 0, 12.5));
      place(c, [lerp(0.3, 0.0, k), lerp(0.85, 1.15, k), lerp(2.25, 3.65, k)], [0, lerp(0.52, 0.72, k), 0]);
      return { dof: { focus: c.position.distanceTo(V(0, 0.58, 0.08)), aperture: 0.002, maxblur: 0.005 }, bloom: 0.55 + dawn * 0.65 };
    },
  };
}

export const SHOTS = [
  { start: 0.00, end: 4.11, build: shot1 },
  { start: 4.11, end: 9.67, build: shot2 },
  { start: 9.67, end: 14.80, build: shot3 },
  { start: 14.80, end: 21.15, build: shot4 },
  { start: 21.15, end: 24.84, build: shot5 },
  { start: 24.84, end: 28.88, build: shot6 },
  { start: 28.88, end: 36.96, build: shot7 },
  { start: 36.96, end: 43.42, build: shot8 },
  { start: 43.42, end: 50.98, build: shot9 },
  { start: 50.98, end: 65.24, build: shot10 },
  { start: 65.24, end: 78.02, build: shot11 },
  { start: 78.02, end: 90.58, build: shot12 },
];
