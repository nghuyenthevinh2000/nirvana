// 2D flat-vector animation for SN 36.6 (The Second Arrow) — styled after wygxbDkvwOA
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
let DURATION = 64.80;

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
  DURATION = Math.max(64.80, words[words.length - 1].e + 0.5);
  window.DURATION = DURATION;
})();

// --- Drawing Primitives (2D Flat-Vector with Clean Dark Outlines) ---
const INK = '#231f20';

function drawBackdrop(t, opts = {}) {
  // Color-temperature arc: dusk indigo (0-18s) -> midnight (18-32s) -> golden sunrise (32-64.8s)
  let warmth = 0;
  if (t >= 32.0) warmth = smooth(32.0, 44.0, t);
  if (t >= 64.3) warmth = lerp(warmth, 0.0, smooth(64.3, 64.8, t)); // seamless loop dip toward dusk
  const night = t >= 16.0 && t < 32.5 ? smooth(16.0, 20.0, t) * (1 - smooth(30.5, 32.5, t)) : 0;

  let skyTop = mixHex('#23254b', '#f28b30', warmth);
  let skyBot = mixHex('#6b5b8c', '#fbd37a', warmth);
  let hillC = mixHex('#2f2e58', '#6b495d', warmth);
  let riverTop = mixHex('#387c96', '#e8b35a', warmth);
  let riverBot = mixHex('#58a4b8', '#f5d27a', warmth);
  let bankC = mixHex('#8b7f96', '#b38d66', warmth);

  if (night > 0) {
    skyTop = mixHex(skyTop, '#0d1430', night * 0.9);
    skyBot = mixHex(skyBot, '#1c2a54', night * 0.9);
    hillC = mixHex(hillC, '#141c3b', night * 0.9);
    riverTop = mixHex(riverTop, '#1b3d5e', night * 0.85);
    riverBot = mixHex(riverBot, '#265378', night * 0.85);
    bankC = mixHex(bankC, '#4e526b', night * 0.85);
  }

  const sg = ctx.createLinearGradient(0, 0, 0, 960);
  sg.addColorStop(0, skyTop);
  sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, 960);

  // Sun (sunrise) or Moon (night)
  if (warmth > 0.05) {
    const sunY = lerp(890, 560, warmth);
    ctx.save();
    ctx.globalAlpha = clamp(warmth * 1.2);
    ctx.fillStyle = 'rgba(255, 224, 120, 0.25)';
    ctx.beginPath(); ctx.arc(760, sunY, 175, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcf56';
    ctx.beginPath(); ctx.arc(760, sunY, 105, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (night > 0.1) {
    ctx.save();
    ctx.globalAlpha = night;
    ctx.fillStyle = 'rgba(235, 240, 255, 0.15)';
    ctx.beginPath(); ctx.arc(240, 320, 120, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eef2d8';
    ctx.beginPath(); ctx.arc(240, 320, 74, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Distant hills + stupa silhouette
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

  // River shimmer lines
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const rx = ((i * 170 + t * 28) % (W + 160)) - 80;
    const ry = 975 + (i % 4) * 44;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 65 + (i % 3) * 25, ry); ctx.stroke();
  }

  // Foreground riverbank
  ctx.fillStyle = bankC;
  ctx.fillRect(0, 1180, W, H - 1180);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 1180); ctx.lineTo(W, 1180); ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = 'rgba(35,31,32,0.45)';
  ctx.lineWidth = 3.5;
  for (const [gx, gy] of [[160, 1340], [340, 1590], [640, 1370], [890, 1620], [500, 1740]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy); ctx.lineTo(gx - 12, gy - 24);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 28);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 15, gy - 20);
    ctx.stroke();
  }

  // Banyan canopy & hanging vines at top (unless close-up river)
  if (!opts.noCanopy) {
    ctx.fillStyle = mixHex('#244736', '#355c3c', warmth);
    for (const [cx, cy, r] of [[120, 40, 190], [360, 20, 210], [640, 50, 185], [920, 30, 220]]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#3d2c20';
    ctx.lineWidth = 5;
    for (const [vx, vh] of [[140, 380], [290, 310], [490, 260], [740, 330], [930, 390]]) {
      ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx + Math.sin(t * 1.2 + vx) * 4, vh); ctx.stroke();
    }
  }

  // Floating glow particles
  ctx.fillStyle = 'rgba(255, 240, 180, 0.38)';
  for (let i = 0; i < 12; i++) {
    const px = (i * 197 + Math.sin(t * 0.7 + i) * 30) % W;
    const py = 650 + ((i * 113 - t * 18) % 620 + 620) % 620;
    ctx.beginPath(); ctx.arc(px, py, 3.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
}

function drawSpeechBubble(x, y, text, tailDir = 'down', bg = '#f7e6b7') {
  ctx.save();
  ctx.font = '700 38px Cap, sans-serif';
  const padX = 36, padY = 22;
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

function drawArrow(tipX, tipY, angleDeg, variant = 'wood', scale = 1, embedded = false) {
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.scale(scale, scale);
  const shaft = variant === 'dark' ? '#b8252a' : '#8a5a36';
  const fletch = variant === 'dark' ? '#ff5449' : '#e6d7b9';
  if (variant === 'dark') {
    ctx.shadowColor = 'rgba(255, 60, 60, 0.75)';
    ctx.shadowBlur = 18;
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;

  // Shaft extends backward from tip (0, 0) to tail (-150, 0)
  const shaftEnd = embedded ? -4 : -26;
  const shaftLen = shaftEnd - (-150);
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.roundRect(-150, -5, shaftLen, 10, 4);
  ctx.fill(); ctx.stroke();

  if (embedded) {
    // Small impact notch at entry point; arrowhead is buried inside
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // Arrowhead ends cleanly at (0, 0)
    ctx.fillStyle = variant === 'dark' ? '#2b090c' : '#9aa3ad';
    ctx.beginPath();
    ctx.moveTo(-28, -13); ctx.lineTo(0, 0); ctx.lineTo(-28, 13); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  // Fletching at tail (-150)
  ctx.fillStyle = fletch;
  ctx.beginPath();
  ctx.moveTo(-150, -4); ctx.lineTo(-174, -18); ctx.lineTo(-136, -4);
  ctx.moveTo(-150, 4); ctx.lineTo(-174, 18); ctx.lineTo(-136, 4);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawFlyingArrow(t, tStart, tHit, p0, p1, arcHeight, variant = 'wood', scale = 1) {
  if (t < tStart) return;
  if (t <= tHit) {
    const u = clamp((t - tStart) / (tHit - tStart));
    const x = lerp(p0.x, p1.x, u);
    const y = lerp(p0.y, p1.y, u) - arcHeight * 4 * u * (1 - u);
    const dx = p1.x - p0.x;
    const dy = (p1.y - p0.y) - arcHeight * 4 * (1 - 2 * u);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    // Motion streak behind tail
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((ang * Math.PI) / 180);
    ctx.strokeStyle = variant === 'dark' ? 'rgba(255,90,80,0.45)' : 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-185, -8); ctx.lineTo(-245, -8);
    ctx.moveTo(-190, 8); ctx.lineTo(-235, 8);
    ctx.stroke();
    ctx.restore();
    drawArrow(x, y, ang, variant, scale, false);
  } else {
    const dx = p1.x - p0.x;
    const dy = (p1.y - p0.y) + arcHeight * 4;
    const angEnd = (Math.atan2(dy, dx) * 180) / Math.PI;
    const dt = t - tHit;
    const wobble = dt < 0.65 ? Math.sin(dt * 42) * Math.exp(-dt * 8) * 9 : 0;
    if (dt < 0.28) {
      const r = 10 + (dt / 0.28) * 44;
      ctx.save();
      ctx.strokeStyle = variant === 'dark' ? `rgba(255,80,80,${1 - dt / 0.28})` : `rgba(255,240,200,${1 - dt / 0.28})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(p1.x, p1.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    drawArrow(p1.x, p1.y, angEnd + wobble, variant, scale, true);
  }
}

function drawBuddha(x, y, scale = 1, t = 0, opts = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2) * 3);
  ctx.scale(scale, scale);
  // Aura
  ctx.fillStyle = 'rgba(255, 224, 140, 0.22)';
  ctx.beginPath(); ctx.arc(0, -90, 130, 0, Math.PI * 2); ctx.fill();
  // Mat
  ctx.fillStyle = '#7c766b'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-125, 10, 250, 28, 14); ctx.fill(); ctx.stroke();
  // Crossed legs & robe
  ctx.fillStyle = '#e58a2d';
  ctx.beginPath(); ctx.ellipse(0, 0, 118, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Torso
  ctx.beginPath();
  ctx.moveTo(-68, 0); ctx.quadraticCurveTo(-62, -110, 0, -115);
  ctx.quadraticCurveTo(62, -110, 68, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Sash
  ctx.fillStyle = '#c96f1a';
  ctx.beginPath();
  ctx.moveTo(-55, -75); ctx.lineTo(58, -10); ctx.lineTo(50, 5); ctx.lineTo(-62, -62); ctx.closePath();
  ctx.fill();
  // Head + ears + ushnisha
  ctx.fillStyle = '#e3b386';
  ctx.beginPath(); ctx.ellipse(-56, -150, 12, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(56, -150, 12, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -155, 52, 58, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Hair
  ctx.fillStyle = '#333642';
  ctx.beginPath(); ctx.arc(0, -218, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -168, 52, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
  // Calm face
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-26, -156); ctx.quadraticCurveTo(-18, -150, -10, -156);
  ctx.moveTo(10, -156); ctx.quadraticCurveTo(18, -150, 26, -156);
  ctx.moveTo(-12, -124); ctx.quadraticCurveTo(0, -116, 12, -124);
  ctx.stroke();
  // Raised teaching hand if requested
  if (opts.handUp) {
    ctx.fillStyle = '#e3b386'; ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.roundRect(45, -95, 26, 55, 12); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawTraveler(x, y, scale = 1, opts = {}) {
  const {
    kind = 'ordinary', // 'ordinary' | 'wise'
    pose = 'stand',    // 'stand' | 'kneel' | 'collapse' | 'bow'
    mood = 'calm',     // 'calm' | 'shock' | 'angry' | 'wince'
    arrow1 = false,
    arrow2 = false,
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const skin = '#d89f72';
  const robe = kind === 'wise' ? '#c76b29' : '#9e3232';
  const sash = kind === 'wise' ? '#e58a2d' : '#2f8a8a';

  if (pose === 'collapse') ctx.rotate(0.32);

  // Lower body
  ctx.fillStyle = robe; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  if (pose === 'kneel' || pose === 'collapse') {
    ctx.beginPath(); ctx.ellipse(0, 0, 82, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(-42, -65, 84, 72, 16); ctx.fill(); ctx.stroke();
  }

  // Torso
  const ty = pose === 'kneel' || pose === 'collapse' ? -8 : -68;
  ctx.fillStyle = kind === 'wise' ? robe : skin;
  ctx.beginPath();
  ctx.roundRect(-46, ty - 95, 92, 98, 28);
  ctx.fill(); ctx.stroke();

  // Sash
  ctx.fillStyle = sash;
  ctx.fillRect(-45, ty - 18, 90, 18);
  ctx.strokeRect(-45, ty - 18, 90, 18);

  // Bow in hand if pose === 'bow' (held on right, aimed inward at chest)
  if (pose === 'bow') {
    const pull = clamp(opts.bowPull ?? 0.6);
    const bx = 76, by = ty - 58;
    ctx.strokeStyle = '#3b1518'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(bx, by, 68, Math.PI * 0.55, Math.PI * 1.45); ctx.stroke();
    ctx.strokeStyle = '#d9c8b4'; ctx.lineWidth = 3;
    const pullX = bx + 26 * pull;
    ctx.beginPath(); ctx.moveTo(bx + 12, by - 66); ctx.lineTo(pullX, by); ctx.lineTo(bx + 12, by + 66); ctx.stroke();
    // Nocked dark arrow aimed left toward chest (only before release)
    if (opts.showNocked !== false) drawArrow(pullX - 140, by + 4, 174, 'dark', 0.95, false);
  }

  // Head
  const hy = ty - 142;
  ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, hy, 44, 48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Hair / Bald monk
  if (kind === 'ordinary') {
    ctx.fillStyle = '#25262e';
    ctx.beginPath(); ctx.arc(0, hy - 54, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hy - 12, 44, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
    // Mustache
    ctx.beginPath(); ctx.roundRect(-16, hy + 14, 32, 8, 4); ctx.fill();
  }

  // Eyes & Mouth
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4;
  if (mood === 'angry' || mood === 'shock') {
    ctx.beginPath(); ctx.moveTo(-24, hy - 18); ctx.lineTo(-8, hy - 10); ctx.moveTo(24, hy - 18); ctx.lineTo(8, hy - 10); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-16, hy - 4, 8, 0, Math.PI * 2); ctx.arc(16, hy - 4, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(-16, hy - 4, 3.5, 0, Math.PI * 2); ctx.arc(16, hy - 4, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, hy + 28, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  } else if (mood === 'wince') {
    ctx.beginPath();
    ctx.moveTo(-24, hy - 8); ctx.lineTo(-10, hy - 2); ctx.lineTo(-24, hy + 4);
    ctx.moveTo(24, hy - 8); ctx.lineTo(10, hy - 2); ctx.lineTo(24, hy + 4);
    ctx.moveTo(-12, hy + 24); ctx.quadraticCurveTo(0, hy + 18, 12, hy + 24);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 6); ctx.quadraticCurveTo(-15, -1 + hy, -8, hy - 6);
    ctx.moveTo(8, hy - 6); ctx.quadraticCurveTo(15, -1 + hy, 22, hy - 6);
    ctx.moveTo(-10, hy + 20); ctx.quadraticCurveTo(0, hy + 26, 10, hy + 20);
    ctx.stroke();
  }

  if (arrow1) drawArrow(-20, ty - 74, 24, 'wood', 0.95, true);
  if (arrow2) drawArrow(12, ty - 48, 155, 'dark', 1.0, true);
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

function drawThoughtIcons(x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3) * 10);
  ctx.fillStyle = '#fff5da'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-42, 62, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-65, 92, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Gold coin / cup icon
  ctx.fillStyle = '#f2b632';
  ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function renderScene(t) {
  ctx.clearRect(0, 0, W, H);

  // Subtle Ken Burns zoom on certain shots
  const zoomShot = (t >= 2.28 && t < 9.12) || (t >= 35.92 && t < 38.08) || (t >= 51.12 && t < 54.80);
  ctx.save();
  if (zoomShot) {
    const s = 1 + 0.04 * ((t % 4) / 4);
    ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
  }

  if (t >= 51.12 && t < 54.80) {
    // Shot 15: Golden river close-up with vertical trunks & drifting leaves
    drawBackdrop(t, { noCanopy: true });
    ctx.fillStyle = '#473022';
    for (const tx of [90, 260, 510, 790, 960]) ctx.fillRect(tx, 0, 26, 1220);
    ctx.fillStyle = '#4f8f47';
    for (let i = 0; i < 8; i++) {
      const lx = W - (((t - 51.12) * 180 + i * 160) % (W + 120)) + 60;
      const ly = 980 + (i % 4) * 45;
      ctx.beginPath(); ctx.ellipse(lx, ly, 22, 9, 0.2, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    drawBackdrop(t);

    if (t < 5.52) {
      // Shot 1-2: Hook in media res
      drawBuddha(250, 1230, 0.92, t);
      drawTraveler(575, 1245, 0.9, { kind: 'wise', pose: 'kneel', mood: 'calm', arrow1: true });
      drawTraveler(835, 1260, 0.9, { kind: 'ordinary', pose: 'collapse', mood: 'shock', arrow1: true, arrow2: true });
      if (t < 2.6) drawSpeechBubble(800, 955, 'Sao lại hai?');
    } else if (t < 9.12) {
      // Shot 3: Buddha close-up
      drawBuddha(540, 1255, 1.45, t, { handUp: true });
    } else if (t < 16.16) {
      // Shot 4-5: 1st arrow flies fast on a parabolic arc and embeds tip-first
      const tHit = 9.75;
      const hit = t >= tHit;
      const recoil = hit && t < tHit + 0.25 ? Math.sin(((t - tHit) / 0.25) * Math.PI) * 8 : 0;
      drawTraveler(540 + recoil, 1265, 1.15, { kind: 'ordinary', pose: 'stand', mood: hit ? 'wince' : 'calm', arrow1: false });
      drawFlyingArrow(t, 9.25, tHit, { x: -60, y: 840 }, { x: 516, y: 1102 }, 110, 'wood', 1.1);
      if (t >= 10.6 && t < 13.5) drawSpeechBubble(540, 820, 'Mũi tên thứ 1');
    } else if (t < 23.84) {
      // Shot 6-7: Resistance + Chasing distractions
      drawTraveler(460, 1265, 1.05, { kind: 'ordinary', pose: 'stand', mood: 'angry', arrow1: true });
      if (t < 20.0) {
        drawSpeechBubble(460, 830, 'Tại sao là tôi?!');
      } else {
        drawThoughtIcons(760, 890, t);
        drawThoughtIcons(860, 1040, t + 1);
      }
    } else if (t < 32.08) {
      // Shot 8-9: Drawing 2nd bow -> fast self-shot -> collapse at night
      const tRelease = 27.30, tHit = 27.54;
      const fired = t >= tHit;
      const drawFrac = smooth(25.0, tRelease - 0.1, t);
      const recoil = fired && t < tHit + 0.3 ? Math.sin(((t - tHit) / 0.3) * Math.PI) * -10 : 0;
      drawTraveler(540 + recoil, 1265, 1.08, {
        kind: 'ordinary',
        pose: fired ? 'collapse' : 'bow',
        bowPull: t < tRelease ? drawFrac : 0,
        showNocked: t < tRelease,
        mood: 'shock',
        arrow1: true,
        arrow2: false,
      });
      if (t >= tRelease) {
        drawFlyingArrow(t, tRelease, tHit, { x: 645, y: 1140 }, { x: 552, y: 1208 }, 16, 'dark', 1.05);
      }
      if (fired) drawSpeechBubble(540, 830, 'Mũi tên thứ 2!', 'down', '#ffd6d6');
    } else if (t < 45.28) {
      // Shot 10-13: Sunrise Turn — Wise Disciple feels 1st arrow, stays steady
      const tHit = 33.15;
      const hit = t >= tHit;
      const wince = t >= 35.5 && t < 38.2;
      drawTraveler(540, 1265, 1.12, {
        kind: 'wise',
        pose: 'kneel',
        mood: wince ? 'wince' : 'calm',
        arrow1: false,
      });
      drawFlyingArrow(t, 32.65, tHit, { x: -60, y: 920 }, { x: 518, y: 1172 }, 95, 'wood', 1.06);
      if (t >= 38.2) {
        const ring = ((t - 38.2) * 0.7) % 1;
        ctx.strokeStyle = `rgba(255, 224, 120, ${1 - ring})`;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(540, 1120, 130 + ring * 180, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (t < 51.12) {
      // Shot 14: 2nd arrow drops under gravity with small bounce & dissolves
      drawTraveler(360, 1260, 1.0, { kind: 'wise', pose: 'kneel', mood: 'calm', arrow1: true });
      const tDrop = 45.28, tLand = 45.92;
      const u = clamp((t - tDrop) / (tLand - tDrop));
      const dtLand = Math.max(0, t - tLand);
      const bounce = t > tLand ? Math.abs(Math.sin(dtLand * 14)) * Math.exp(-dtLand * 6) * 26 : 0;
      const ay = t <= tLand ? lerp(980, 1272, u * u) : 1272 - bounce;
      const ang = t <= tLand ? lerp(28, 0, u) : 0;
      ctx.save();
      ctx.globalAlpha = 1 - smooth(47.8, 49.5, t);
      drawArrow(780, ay, ang, 'dark', 1.0, false);
      ctx.restore();
      drawSpeechBubble(360, 860, 'Chỉ một thôi.');
    } else {
      // Shot 16: Takeaway & loop
      drawBuddha(250, 1230, 0.92, t, { handUp: true });
      drawTraveler(575, 1245, 0.9, { kind: 'wise', pose: 'kneel', mood: 'calm', arrow1: true });
      drawTraveler(835, 1245, 0.9, { kind: 'ordinary', pose: 'kneel', mood: 'calm', arrow1: true });
      drawSpeechBubble(540, 770, 'Đặt mũi tên thứ hai xuống.', 'none');
    }
  }
  ctx.restore();

  drawSubtitles(t);
}

window.renderAt = renderScene;
