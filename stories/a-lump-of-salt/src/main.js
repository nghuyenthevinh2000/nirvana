// 2D flat-vector animation for AN 3.100 (A Lump of Salt) — styled after nirvana/brand.json
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
let DURATION = 62.5;

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
  DURATION = words[words.length - 1].e + 0.5;
  window.DURATION = DURATION;
})();

const INK = '#231f20';

function drawBackdrop(t, opts = {}) {
  // Color arc: warm-apricot dawn (0-16s) -> dusk/storm (16-31.2s) -> golden sunrise (31.2-62.5s)
  let warmth = smooth(31.2, 42.0, t);
  const storm = t >= 15.0 && t < 31.8 ? smooth(15.0, 19.0, t) * (1 - smooth(29.8, 31.8, t)) : 0;

  let skyTop = mixHex('#f7d9a8', '#f5a642', warmth);
  let skyBot = mixHex('#fff3dc', '#ffe49e', warmth);
  let hillC = mixHex('#c99c7c', '#9c6b5e', warmth);
  let riverTop = mixHex('#7ec4cf', '#f0c065', warmth);
  let riverBot = mixHex('#b5e2e8', '#fae096', warmth);
  let bankC = mixHex('#d9c3a3', '#cca378', warmth);

  if (storm > 0) {
    skyTop = mixHex(skyTop, '#3b3754', storm * 0.85);
    skyBot = mixHex(skyBot, '#726582', storm * 0.85);
    hillC = mixHex(hillC, '#3b3248', storm * 0.85);
    riverTop = mixHex(riverTop, '#3a5366', storm * 0.8);
    riverBot = mixHex(riverBot, '#567487', storm * 0.8);
    bankC = mixHex(bankC, '#8a7e78', storm * 0.75);
  }

  const sg = ctx.createLinearGradient(0, 0, 0, 960);
  sg.addColorStop(0, skyTop);
  sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, 960);

  // Sun
  const sunAlpha = clamp(1 - storm * 0.85);
  const sunY = lerp(820, 560, warmth);
  ctx.save();
  ctx.globalAlpha = sunAlpha;
  ctx.fillStyle = 'rgba(255, 224, 120, 0.28)';
  ctx.beginPath(); ctx.arc(760, sunY, 175, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = warmth > 0.3 ? '#ffd24c' : '#ffe8a3';
  ctx.beginPath(); ctx.arc(760, sunY, 105, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Distant hills + stupa
  ctx.fillStyle = hillC;
  ctx.beginPath();
  ctx.moveTo(0, 880);
  ctx.quadraticCurveTo(320, 760, 680, 820);
  ctx.quadraticCurveTo(900, 850, W, 790);
  ctx.lineTo(W, 960); ctx.lineTo(0, 960); ctx.closePath(); ctx.fill();

  ctx.save();
  ctx.translate(715, 795);
  ctx.beginPath();
  ctx.arc(0, 0, 36, Math.PI, 0);
  ctx.lineTo(36, 32); ctx.lineTo(-36, 32); ctx.closePath(); ctx.fill();
  ctx.fillRect(-5, -55, 10, 22);
  ctx.fillStyle = '#e06d3b';
  ctx.beginPath(); ctx.moveTo(5, -55); ctx.lineTo(26, -48); ctx.lineTo(5, -41); ctx.fill();
  ctx.restore();

  // River band (wider when riverFocus is true)
  const riverY0 = opts.riverFocus ? 880 : 940;
  const riverY1 = opts.riverFocus ? 1320 : 1180;
  const rg = ctx.createLinearGradient(0, riverY0, 0, riverY1);
  rg.addColorStop(0, riverTop);
  rg.addColorStop(1, riverBot);
  ctx.fillStyle = rg;
  ctx.fillRect(0, riverY0, W, riverY1 - riverY0);

  ctx.strokeStyle = 'rgba(255,255,255,0.34)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    const rx = ((i * 170 + t * 32) % (W + 160)) - 80;
    const ry = riverY0 + 35 + (i % 5) * ((riverY1 - riverY0 - 60) / 5);
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 70 + (i % 3) * 25, ry); ctx.stroke();
  }

  // Foreground riverbank
  ctx.fillStyle = bankC;
  ctx.fillRect(0, riverY1, W, H - riverY1);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, riverY1); ctx.lineTo(W, riverY1); ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = 'rgba(35,31,32,0.42)';
  ctx.lineWidth = 3.5;
  for (const [gx, gy] of [[160, 1380], [340, 1590], [640, 1410], [890, 1620], [500, 1740]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy); ctx.lineTo(gx - 12, gy - 24);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 28);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 15, gy - 20);
    ctx.stroke();
  }

  // Banyan canopy & vines
  if (!opts.noCanopy) {
    ctx.fillStyle = mixHex('#4e7a4f', '#4a7545', warmth);
    for (const [cx, cy, r] of [[120, 40, 190], [360, 20, 210], [640, 50, 185], [920, 30, 220]]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#5c402c';
    ctx.lineWidth = 5;
    for (const [vx, vh] of [[140, 340], [290, 280], [490, 230], [740, 290], [930, 350]]) {
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

function drawThumbnailCard(x, y, line1, line2, variant = 'positive') {
  const w = 468, h = 148, r = 28;
  const bg = variant === 'positive' ? '#f7e6b7' : '#ffd6d6';
  const accent = variant === 'positive' ? '#b55612' : '#b8252a';
  ctx.save();
  ctx.fillStyle = bg;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = '700 30px Cap, sans-serif';
  ctx.fillText(line1, x, y - 24);
  ctx.fillStyle = INK;
  ctx.font = '700 34px Cap, sans-serif';
  ctx.fillText(line2, x, y + 24);
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

function drawSaltLump(x, y, scale = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f8f9fa';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-22, -10); ctx.lineTo(-6, -24); ctx.lineTo(18, -16);
  ctx.lineTo(24, 6); ctx.lineTo(6, 22); ctx.lineTo(-18, 14); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Crystal facet lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, -24); ctx.lineTo(0, 0); ctx.lineTo(24, 6);
  ctx.moveTo(0, 0); ctx.lineTo(-18, 14);
  ctx.stroke();
  ctx.restore();
}

function drawMug(x, y, scale = 1, salty = 0, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Handle
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(62, -48, 28, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  // Mug body
  ctx.fillStyle = '#e7dcc8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-62, -100, 124, 110, [10, 10, 26, 26]);
  ctx.fill(); ctx.stroke();

  // Water inside top ellipse
  const waterC = mixHex('#7ec4cf', '#6e5c52', salty);
  ctx.fillStyle = waterC;
  ctx.beginPath();
  ctx.ellipse(0, -88, 52, 16, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Salt ripples when salty
  if (salty > 0.1) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.65 * salty})`;
    ctx.lineWidth = 3;
    const r = 12 + ((t * 45) % 34);
    ctx.beginPath();
    ctx.ellipse(0, -88, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
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

function drawCharacter(x, y, scale = 1, opts = {}) {
  const { kind = 'ordinary', pose = 'stand', mood = 'calm', holdingMug = false, salty = 0 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const skin = '#d89f72';
  const robe = kind === 'wise' ? '#c76b29' : '#9e3232';
  const sash = kind === 'wise' ? '#e58a2d' : '#2f8a8a';

  ctx.fillStyle = robe; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  if (pose === 'kneel') {
    ctx.beginPath(); ctx.ellipse(0, 0, 82, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(-42, -65, 84, 72, 16); ctx.fill(); ctx.stroke();
  }

  const ty = pose === 'kneel' ? -8 : -68;
  ctx.fillStyle = kind === 'wise' ? robe : skin;
  ctx.beginPath(); ctx.roundRect(-46, ty - 95, 92, 98, 28); ctx.fill(); ctx.stroke();

  ctx.fillStyle = sash;
  ctx.fillRect(-45, ty - 18, 90, 18);
  ctx.strokeRect(-45, ty - 18, 90, 18);

  const hy = ty - 142;
  ctx.fillStyle = skin; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, hy, 44, 48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  if (kind === 'ordinary') {
    ctx.fillStyle = '#25262e';
    ctx.beginPath(); ctx.arc(0, hy - 54, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hy - 12, 44, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-16, hy + 14, 32, 8, 4); ctx.fill();
  }

  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4;
  if (mood === 'angry') {
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
    ctx.moveTo(-14, hy + 26); ctx.quadraticCurveTo(0, hy + 16, 14, hy + 26);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 6); ctx.quadraticCurveTo(-15, hy - 1, -8, hy - 6);
    ctx.moveTo(8, hy - 6); ctx.quadraticCurveTo(15, hy - 1, 22, hy - 6);
    ctx.moveTo(-10, hy + 20); ctx.quadraticCurveTo(0, hy + 26, 10, hy + 20);
    ctx.stroke();
  }

  if (holdingMug) drawMug(66, ty - 26, 0.55, salty);
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
  const riverClose = t >= 31.2 && t < 41.6;
  drawBackdrop(t, { riverFocus: riverClose, noCanopy: riverClose });

  if (t < 6.2) {
    // Scene 1: Opening framing — Buddha + 2 contrasting characters + 2 thumbnail cards
    drawThumbnailCard(280, 620, 'TÂM RỘNG (SÔNG)', 'VẪN NGỌT LÀNH', 'positive');
    drawThumbnailCard(800, 620, 'TÂM HẸP (CỐC)', 'MẶN CHÁT', 'negative');
    drawBuddha(240, 1235, 0.92, t);
    drawCharacter(575, 1250, 0.9, { kind: 'wise', pose: 'kneel', mood: 'calm' });
    drawCharacter(845, 1265, 0.9, { kind: 'ordinary', pose: 'stand', mood: 'wince', holdingMug: true, salty: 1 });
    if (t < 3.0) drawSpeechBubble(845, 920, 'Mặn quá!', 'down', '#ffd6d6');
  } else if (t < 9.5) {
    // Scene 2: Buddha close-up
    drawBuddha(540, 1255, 1.45, t, { handUp: true });
    drawSaltLump(760, 1020 + Math.sin(t * 2) * 8, 1.1, 1);
  } else if (t < 17.0) {
    // Scene 3: Salt lump drops into small mug
    const tDrop = 10.2, tSplash = 11.4;
    const u = clamp((t - tDrop) / (tSplash - tDrop));
    const salty = smooth(tSplash, tSplash + 1.2, t);
    drawMug(540, 1230, 1.85, salty, t);
    if (t < tSplash) {
      drawSaltLump(540, lerp(760, 1060, u * u), 1.35, 1);
    } else {
      drawSaltLump(540, 1070, 1.1, 1 - smooth(tSplash, tSplash + 1.5, t));
      drawSpeechBubble(540, 810, 'Mặn chát!', 'down', '#ffd6d6');
    }
  } else if (t < 31.2) {
    // Scene 4: Narrow-hearted character overwhelmed by small salt/mistake
    const angry = t >= 20.3;
    const shake = angry ? Math.sin(t * 26) * 5 : 0;
    // Tight boundary ring showing narrow capacity
    ctx.save();
    ctx.strokeStyle = 'rgba(184, 37, 42, 0.55)';
    ctx.lineWidth = 8;
    ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.arc(540, 1140, 230, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    drawCharacter(540 + shake, 1265, 1.12, {
      kind: 'ordinary',
      pose: 'stand',
      mood: angry ? 'angry' : 'wince',
      holdingMug: true,
      salty: 1,
    });
    if (t < 24.5) drawSpeechBubble(540, 810, 'Lỗi nhỏ... nhưng dậy sóng!', 'down', '#ffd6d6');
    else drawSpeechBubble(540, 810, 'Không nuốt nổi!', 'down', '#ffd6d6');
  } else if (t < 41.6) {
    // Scene 5: Same lump of salt drops into the vast Ganges River & dissolves
    const tDrop = 32.2, tHit = 33.4;
    const u = clamp((t - tDrop) / (tHit - tDrop));
    if (t < tHit) {
      drawSaltLump(540, lerp(650, 1080, u * u), 1.3, 1);
    } else {
      const dt = t - tHit;
      const alpha = 1 - smooth(0, 1.6, dt);
      drawSaltLump(540, 1080, 1.2 * (1 - clamp(dt / 2) * 0.4), alpha);
      for (let i = 0; i < 2; i++) {
        const ring = ((dt * 0.7 + i * 0.5) % 1);
        ctx.strokeStyle = `rgba(255, 248, 220, ${(1 - ring) * 0.8})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(540, 1080, 40 + ring * 260, 14 + ring * 70, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (t >= 37.0) drawSpeechBubble(540, 760, 'Vẫn ngọt lành.', 'down', '#f7e6b7');
    }
  } else if (t < 54.2) {
    // Scene 6: Wise character by the golden river — serene & expansive
    const ring = ((t - 41.6) * 0.65) % 1;
    ctx.strokeStyle = `rgba(255, 224, 120, ${(1 - ring) * 0.75})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(540, 1140, 140 + ring * 230, 0, Math.PI * 2); ctx.stroke();

    drawCharacter(540, 1265, 1.12, { kind: 'wise', pose: 'kneel', mood: 'calm' });
    if (t >= 48.0) drawSpeechBubble(540, 820, 'Tâm đủ rộng để hòa tan.', 'down', '#f7e6b7');
  } else {
    // Scene 7: Calm resolution with Buddha handUp
    drawBuddha(240, 1235, 0.92, t, { handUp: true });
    drawCharacter(575, 1250, 0.9, { kind: 'wise', pose: 'kneel', mood: 'calm' });
    drawCharacter(845, 1250, 0.9, { kind: 'ordinary', pose: 'kneel', mood: 'calm' });
    drawSpeechBubble(540, 770, 'Mở rộng dòng sông bên trong.', 'none', '#f7e6b7');
  }

  drawSubtitles(t);
}

window.renderAt = renderScene;
