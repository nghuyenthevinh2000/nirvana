// 2D flat-vector animation for durian-tree-love — styled from ../../brand.json (the-second-arrow)
const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const mixHex = (c1, c2, t) => {
  const u = clamp(t);
  const p = c => c.startsWith('rgb')
    ? c.match(/\d+/g).map(Number)
    : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const [r1, g1, b1] = p(c1), [r2, g2, b2] = p(c2);
  return `rgb(${Math.round(lerp(r1, r2, u))},${Math.round(lerp(g1, g2, u))},${Math.round(lerp(b1, b2, u))})`;
};

let PHRASES = [];
let DURATION = 76.02;

function groupWords(words) {
  const out = [];
  let cur = [];
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const txt = cur.map(x => x.w).join(' ');
    const stop = /[.,?!;:]$/.test(words[i].w);
    if (stop || cur.length >= 4 || txt.length >= 22) {
      out.push({ words: cur, s: cur[0].s, e: words[i].e });
      cur = [];
    }
  }
  if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
  return out;
}

window.ready = (async () => {
  await document.fonts.ready;
  const words = await fetch('./audio/vo.words.json').then(r => r.json());
  PHRASES = groupWords(words);
  DURATION = Math.max(76.02, words[words.length - 1].e + 0.5);
  window.DURATION = DURATION;
})();

const INK = '#231f20';

function drawBackdrop(t, opts = {}) {
  // Light & warm color-temperature arc: warm apricot (0-18s) -> soft parchment (18-42s) -> golden sunrise (42-76s)
  let warmth = 0;
  if (t >= 42.3) warmth = smooth(42.3, 54.0, t);
  if (t >= DURATION - 0.6) warmth = lerp(warmth, 0.0, smooth(DURATION - 0.6, DURATION, t));
  const mid = t >= 16.0 && t < 42.5 ? smooth(16.0, 21.0, t) * (1 - smooth(40.0, 42.5, t)) : 0;

  let skyTop = mixHex('#f7d9a8', '#f5a642', warmth);
  let skyBot = mixHex('#fff3dc', '#ffe49e', warmth);
  let hillC = mixHex('#c99c7c', '#9c6b5e', warmth);
  let riverTop = mixHex('#7ec4cf', '#f0c065', warmth);
  let riverBot = mixHex('#b5e2e8', '#fae096', warmth);
  let bankC = mixHex('#d9c3a3', '#cca378', warmth);

  if (mid > 0) {
    skyTop = mixHex(skyTop, '#e8c5b0', mid * 0.85);
    skyBot = mixHex(skyBot, '#f6e3ce', mid * 0.85);
    hillC = mixHex(hillC, '#a88479', mid * 0.85);
    riverTop = mixHex(riverTop, '#7aa6b3', mid * 0.8);
    riverBot = mixHex(riverBot, '#a7c8d1', mid * 0.8);
    bankC = mixHex(bankC, '#c7b097', mid * 0.8);
  }

  const sg = ctx.createLinearGradient(0, 0, 0, 960);
  sg.addColorStop(0, skyTop);
  sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, 960);

  // Warm sun throughout (soft veiled sun in mid, bright golden sun in sunrise)
  const sunY = lerp(690, 540, warmth);
  const sunAlpha = lerp(0.75, 1.0, warmth) * (1 - mid * 0.35);
  ctx.save();
  ctx.globalAlpha = clamp(sunAlpha);
  ctx.fillStyle = 'rgba(255, 228, 140, 0.32)';
  ctx.beginPath(); ctx.arc(760, sunY, 175, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = mixHex('#ffe8a3', '#ffd24c', warmth);
  ctx.beginPath(); ctx.arc(760, sunY, 102, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.fillStyle = hillC;
  ctx.beginPath();
  ctx.moveTo(0, 880);
  ctx.quadraticCurveTo(320, 760, 680, 820);
  ctx.quadraticCurveTo(900, 850, W, 790);
  ctx.lineTo(W, 960); ctx.lineTo(0, 960); ctx.closePath(); ctx.fill();

  // Stupa silhouette
  ctx.save();
  ctx.translate(715, 795);
  ctx.beginPath();
  ctx.arc(0, 0, 36, Math.PI, 0);
  ctx.lineTo(36, 32); ctx.lineTo(-36, 32); ctx.closePath(); ctx.fill();
  ctx.fillRect(-5, -55, 10, 22);
  ctx.fillStyle = '#e06d3b';
  ctx.beginPath(); ctx.moveTo(5, -55); ctx.lineTo(26, -48); ctx.lineTo(5, -41); ctx.fill();
  ctx.restore();

  // River band
  const rg = ctx.createLinearGradient(0, 940, 0, 1180);
  rg.addColorStop(0, riverTop);
  rg.addColorStop(1, riverBot);
  ctx.fillStyle = rg;
  ctx.fillRect(0, 940, W, 240);

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const rx = ((i * 170 + t * 28) % (W + 160)) - 80;
    const ry = 975 + (i % 4) * 44;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 65 + (i % 3) * 25, ry); ctx.stroke();
  }

  ctx.fillStyle = bankC;
  ctx.fillRect(0, 1180, W, H - 1180);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 1180); ctx.lineTo(W, 1180); ctx.stroke();

  ctx.strokeStyle = 'rgba(35,31,32,0.45)';
  ctx.lineWidth = 3.5;
  for (const [gx, gy] of [[160, 1340], [340, 1590], [640, 1370], [890, 1620], [500, 1740]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy); ctx.lineTo(gx - 12, gy - 24);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 28);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 15, gy - 20);
    ctx.stroke();
  }

  if (!opts.noCanopy) {
    ctx.fillStyle = mixHex('#4e7a4f', '#4a7545', warmth);
    for (const [cx, cy, r] of [[120, 40, 190], [360, 20, 210], [640, 50, 185], [920, 30, 220]]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#5c402c';
    ctx.lineWidth = 5;
    for (const [vx, vh] of [[140, 380], [290, 310], [490, 260], [740, 330], [930, 390]]) {
      ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx + Math.sin(t * 1.2 + vx) * 4, vh); ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(255, 240, 180, 0.38)';
  for (let i = 0; i < 12; i++) {
    const px = (i * 197 + Math.sin(t * 0.7 + i) * 30) % W;
    const py = 650 + ((i * 113 - t * 18) % 620 + 620) % 620;
    ctx.beginPath(); ctx.arc(px, py, 3.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
}

function drawThumbnailCard(x, y, w, h, line1, line2, bg = '#f7e6b7', accent = '#c76b29') {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 28);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 32px Cap, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText(line1, x, y - 24);
  ctx.font = '700 34px Cap, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(line2, x, y + 26);
  ctx.restore();
}

function drawSpeechBubble(x, y, text, tailDir = 'down', bg = '#f7e6b7') {
  ctx.save();
  ctx.font = '700 38px Cap, sans-serif';
  const padX = 36;
  const tw = ctx.measureText(text).width;
  const bw = tw + padX * 2, bh = 86;
  const bx = x - bw / 2, by = y - bh / 2;

  ctx.fillStyle = bg;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 34);
  ctx.fill();
  ctx.stroke();

  if (tailDir === 'down') {
    ctx.beginPath();
    ctx.moveTo(x - 16, by + bh - 2);
    ctx.lineTo(x - 4, by + bh + 34);
    ctx.lineTo(x + 18, by + bh - 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 16, by + bh);
    ctx.lineTo(x - 4, by + bh + 34);
    ctx.lineTo(x + 18, by + bh);
    ctx.stroke();
  }

  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 2);
  ctx.restore();
}

function drawHeart(x, y, scale = 1, opts = {}) {
  const { color = '#e85d5d', cracked = false, glow = false } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (glow) {
    ctx.fillStyle = 'rgba(255, 224, 140, 0.35)';
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.bezierCurveTo(-48, 2, -46, -34, -18, -34);
  ctx.bezierCurveTo(-4, -34, 0, -18, 0, -12);
  ctx.bezierCurveTo(0, -18, 4, -34, 18, -34);
  ctx.bezierCurveTo(46, -34, 48, 2, 0, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (cracked) {
    ctx.strokeStyle = '#2b090c';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-4, -14); ctx.lineTo(-12, 2); ctx.lineTo(6, 12); ctx.lineTo(-2, 26);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDurian(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#8fa83b';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  // Spikes around perimeter
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    const sx = Math.cos(a) * 34, sy = Math.sin(a) * 40;
    const tx = Math.cos(a) * 46, ty = Math.sin(a) * 52;
    const lx = Math.cos(a - 0.25) * 32, ly = Math.sin(a - 0.25) * 38;
    const rx = Math.cos(a + 0.25) * 32, ry = Math.sin(a + 0.25) * 38;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.lineTo(rx, ry); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawStrawberry(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#e63946';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 34);
  ctx.quadraticCurveTo(-32, 8, -24, -18);
  ctx.quadraticCurveTo(0, -28, 24, -18);
  ctx.quadraticCurveTo(32, 8, 0, 34);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Leaves
  ctx.fillStyle = '#4f8f47';
  ctx.beginPath();
  ctx.moveTo(-18, -18); ctx.lineTo(0, -30); ctx.lineTo(18, -18); ctx.lineTo(0, -10); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Seeds
  ctx.fillStyle = '#fbd37a';
  for (const [sx, sy] of [[-10, -4], [10, -4], [0, 6], [-8, 14], [8, 14]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawDurianTree(x, y, scale = 1, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Trunk
  ctx.fillStyle = '#5c3d28'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-18, -160, -16, -260);
  ctx.lineTo(16, -260); ctx.quadraticCurveTo(18, -160, 26, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Canopy
  ctx.fillStyle = '#3b6e3c';
  for (const [cx, cy, r] of [[-90, -290, 88], [90, -290, 88], [0, -350, 108], [-45, -240, 72], [45, -240, 72]]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // Hanging durians
  const sway = Math.sin(t * 1.8) * 4;
  for (const [dx, dy, s] of [[-95, -205, 0.72], [0, -230, 0.8], [92, -195, 0.72]]) {
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(dx, dy - 42); ctx.lineTo(dx + sway, dy - 18); ctx.stroke();
    drawDurian(dx + sway, dy + 16, s);
  }
  ctx.restore();
}

function drawBuddha(x, y, scale = 1, t = 0, opts = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2) * 3);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 224, 140, 0.22)';
  ctx.beginPath(); ctx.arc(0, -90, 130, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7c766b'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-125, 10, 250, 28, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e58a2d';
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-68, 0); ctx.quadraticCurveTo(-62, -110, 0, -115);
  ctx.quadraticCurveTo(62, -110, 68, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c96f1a';
  ctx.beginPath();
  ctx.moveTo(-55, -75); ctx.lineTo(58, -10); ctx.lineTo(50, 5); ctx.lineTo(-62, -62); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e3b386';
  ctx.beginPath(); ctx.ellipse(-56, -150, 12, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(56, -150, 12, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -155, 52, 58, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#333642';
  ctx.beginPath(); ctx.arc(0, -218, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -168, 52, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-26, -156); ctx.quadraticCurveTo(-18, -150, -10, -156);
  ctx.moveTo(10, -156); ctx.quadraticCurveTo(18, -150, 26, -156);
  ctx.moveTo(-12, -124); ctx.quadraticCurveTo(0, -116, 12, -124);
  ctx.stroke();
  if (opts.handUp) {
    ctx.fillStyle = '#e3b386'; ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.roundRect(45, -95, 26, 55, 12); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawPerson(x, y, scale = 1, opts = {}) {
  const {
    kind = 'ordinary', // 'ordinary' | 'wise' | 'partner'
    pose = 'stand',    // 'stand' | 'sit' | 'slump' | 'reach'
    mood = 'calm',     // 'calm' | 'anxious' | 'sad' | 'happy'
    wound = false,
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const skin = '#d89f72';
  const robe = kind === 'wise' ? '#c76b29' : kind === 'partner' ? '#3d6e8c' : '#9e3232';
  const sash = kind === 'wise' ? '#e58a2d' : kind === 'partner' ? '#70a9c4' : '#2f8a8a';

  if (pose === 'slump') ctx.rotate(0.18);

  ctx.fillStyle = robe; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  if (pose === 'sit') {
    ctx.beginPath(); ctx.ellipse(0, 0, 82, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(-42, -65, 84, 72, 16); ctx.fill(); ctx.stroke();
  }

  const ty = pose === 'sit' ? -8 : -68;
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.roundRect(-46, ty - 95, 92, 98, 28);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = sash;
  ctx.fillRect(-45, ty - 18, 90, 18);
  ctx.strokeRect(-45, ty - 18, 90, 18);

  if (pose === 'reach') {
    ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.roundRect(40, ty - 75, 62, 22, 11); ctx.fill(); ctx.stroke();
  }

  if (wound) {
    ctx.strokeStyle = '#ff5449'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-14, ty - 68); ctx.lineTo(-4, ty - 52); ctx.lineTo(-16, ty - 38);
    ctx.stroke();
  }

  const hy = ty - 142;
  ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, hy, 44, 48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Hair
  ctx.fillStyle = '#25262e';
  if (kind === 'partner') {
    ctx.beginPath(); ctx.arc(0, hy - 12, 46, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, hy - 54, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hy - 12, 44, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
  }

  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4;
  if (mood === 'anxious' || mood === 'sad') {
    ctx.beginPath(); ctx.moveTo(-24, hy - 16); ctx.lineTo(-8, hy - 10); ctx.moveTo(24, hy - 16); ctx.lineTo(8, hy - 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(-16, hy - 2, 5, 0, Math.PI * 2); ctx.arc(16, hy - 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-12, hy + 24); ctx.quadraticCurveTo(0, hy + 14, 12, hy + 24); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 6); ctx.quadraticCurveTo(-15, hy - 1, -8, hy - 6);
    ctx.moveTo(8, hy - 6); ctx.quadraticCurveTo(15, hy - 1, 22, hy - 6);
    ctx.moveTo(-12, hy + 18); ctx.quadraticCurveTo(0, hy + 28, 12, hy + 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSubtitles(t) {
  const p = PHRASES.find(ph => t >= ph.s - 0.04 && t <= ph.e + 0.14);
  if (!p) return;
  ctx.save();
  ctx.font = '700 54px Cap, sans-serif';
  ctx.textBaseline = 'middle';
  const spaceW = 16;
  const widths = p.words.map(w => ctx.measureText(w.w).width);
  const totalW = widths.reduce((a, b) => a + b, 0) + spaceW * (p.words.length - 1);
  let x = (W - totalW) / 2;
  const y = 1485;

  for (let i = 0; i < p.words.length; i++) {
    const w = p.words[i];
    const active = t >= w.s - 0.03 && t <= w.e + 0.08;
    const text = w.w.replace(/[.,?!]+$/, '');
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#111111';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = active ? '#ff9838' : '#ffffff';
    ctx.fillText(text, x, y);
    x += widths[i] + spaceW;
  }
  ctx.restore();
}

function renderScene(t) {
  ctx.clearRect(0, 0, W, H);
  const zoomShot = (t >= 32.4 && t < 38.2) || (t >= 66.3 && t < 71.5);
  ctx.save();
  if (zoomShot) {
    const s = 1 + 0.04 * ((t % 4) / 4);
    ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
  }

  drawBackdrop(t);

  if (t < 7.5) {
    // Shot 1 (also Thumbnail): Buddha + two people + both outcomes right at the beginning
    drawBuddha(240, 1235, 0.92, t);
    drawPerson(575, 1255, 0.9, { kind: 'wise', pose: 'sit', mood: 'happy' });
    drawPerson(840, 1255, 0.9, { kind: 'ordinary', pose: 'slump', mood: 'anxious', wound: true });
    drawHeart(575, 1020 + Math.sin(t * 2.5) * 6, 0.72, { color: '#ff9838', glow: true });
    drawHeart(840, 1020 + Math.sin(t * 2.5 + 1) * 6, 0.72, { color: '#b8252a', cracked: true });
    drawThumbnailCard(280, 620, 468, 148, 'Tình yêu từ hạnh phúc', '→ Kết quả hạnh phúc', '#f7e6b7', '#b55612');
    drawThumbnailCard(800, 620, 468, 148, 'Tình yêu từ trauma', '→ Kết quả trauma', '#ffd6d6', '#b8252a');
  } else if (t < 10.65) {
    // Shot 2: What each brings into the relationship
    drawHeart(340, 1080, 1.35, { color: '#9e3232', cracked: true });
    drawHeart(740, 1080, 1.35, { color: '#ff9838', glow: true });
    drawSpeechBubble(340, 860, 'Vết thương cũ', 'down', '#ffd6d6');
    drawSpeechBubble(740, 860, 'Sự tròn đầy', 'down', '#f7e6b7');
  } else if (t < 18.7) {
    // Shot 3: Person 1 enters from trauma, seeking rescue
    drawPerson(390, 1265, 1.05, { kind: 'ordinary', pose: 'reach', mood: 'anxious', wound: true });
    drawPerson(750, 1265, 1.0, { kind: 'partner', pose: 'stand', mood: 'calm' });
    drawSpeechBubble(390, 840, 'Hãy làm tôi an toàn', 'down', '#ffd6d6');
  } else if (t < 27.1) {
    // Shot 4: Late message & disagreement -> abandonment fear
    drawPerson(540, 1265, 1.1, { kind: 'ordinary', pose: 'slump', mood: 'sad', wound: true });
    const pulse = 1 + Math.sin(t * 6) * 0.08;
    ctx.save(); ctx.translate(760, 960); ctx.scale(pulse, pulse);
    drawSpeechBubble(0, 0, 'Tin nhắn chậm...', 'down', '#ffd6d6');
    ctx.restore();
  } else if (t < 32.4) {
    // Shot 5: Clinging tears the wound wider at midnight
    drawPerson(540, 1265, 1.15, { kind: 'ordinary', pose: 'slump', mood: 'anxious', wound: true });
    drawHeart(540, 1020, 1.4 + Math.sin(t * 5) * 0.06, { color: '#b8252a', cracked: true });
    drawSpeechBubble(540, 790, 'Bám víu = rách thêm', 'down', '#ffd6d6');
  } else if (t < 42.3) {
    // Shot 6: Durian tree vs Strawberry metaphor
    drawDurianTree(390, 1270, 1.0, t);
    drawStrawberry(790, 1060 + Math.sin(t * 2) * 8, 1.7);
    ctx.strokeStyle = '#d62828'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(735, 1005); ctx.lineTo(845, 1115);
    ctx.moveTo(845, 1005); ctx.lineTo(735, 1115);
    ctx.stroke();
    drawSpeechBubble(540, 750, 'Hạt nào quả nấy', 'down', '#f7e6b7');
  } else if (t < 50.2) {
    // Shot 7: Sunrise — Person 2 sits peacefully alone
    drawPerson(540, 1255, 1.1, { kind: 'wise', pose: 'sit', mood: 'happy' });
    const ring = ((t - 42.3) * 0.6) % 1;
    ctx.strokeStyle = `rgba(255, 224, 120, ${1 - ring})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(540, 1130, 120 + ring * 180, 0, Math.PI * 2); ctx.stroke();
    drawSpeechBubble(540, 820, 'Tự mình tròn đầy');
  } else if (t < 66.3) {
    // Shot 8: Sharing warmth without clinging, steady in wind
    drawPerson(390, 1260, 1.02, { kind: 'wise', pose: 'stand', mood: 'happy' });
    drawPerson(690, 1260, 1.02, { kind: 'partner', pose: 'stand', mood: 'happy' });
    drawHeart(540, 1015 + Math.sin(t * 2.2) * 8, 1.15, { color: '#ff9838', glow: true });
    if (t >= 56.8) {
      drawSpeechBubble(540, 790, 'Lắng nghe, không hoảng loạn');
    } else {
      drawSpeechBubble(540, 790, 'Sẻ chia từ đủ đầy');
    }
  } else {
    // Shot 9: Closing — Buddha + two calm figures + sprouting seed
    drawBuddha(240, 1235, 0.92, t, { handUp: true });
    drawPerson(575, 1255, 0.9, { kind: 'wise', pose: 'sit', mood: 'happy' });
    drawPerson(840, 1255, 0.9, { kind: 'partner', pose: 'sit', mood: 'happy' });
    // Sprouting green seed between them
    ctx.save();
    ctx.translate(708, 1260);
    ctx.fillStyle = '#4f8f47'; ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0, -65, -24, -85); ctx.quadraticCurveTo(4, -75, 4, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-26, -86, 22, 11, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(18, -72, 20, 10, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
    drawSpeechBubble(540, 790, 'Tự chữa lành trước.', 'none');
  }

  ctx.restore();
  drawSubtitles(t);
}

window.renderAt = renderScene;
