// 2D flat-vector animation for sisterhood-refuge (SN 45.2 / Therigatha)
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
let DURATION = 67.40;

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
  DURATION = Math.max(67.40, words[words.length - 1].e + 0.5);
  window.DURATION = DURATION;
})();

const INK = '#231f20';

function drawBackdrop(t) {
  // Color arc from brand.json: dawn (0-16s) -> dusk/storm (16-34s) -> golden sunrise (34-67s)
  let warmth = 0;
  if (t >= 34.4) warmth = smooth(34.4, 45.0, t);
  if (t >= 66.8) warmth = lerp(warmth, 0.0, smooth(66.8, DURATION, t));
  const storm = t >= 16.5 && t < 34.8 ? smooth(16.5, 20.0, t) * (1 - smooth(32.5, 34.8, t)) : 0;

  let skyTop = mixHex('#f7d9a8', '#f5a642', warmth);
  let skyBot = mixHex('#fff3dc', '#ffe49e', warmth);
  let hillC = mixHex('#c99c7c', '#9c6b5e', warmth);
  let riverTop = mixHex('#7ec4cf', '#f0c065', warmth);
  let riverBot = mixHex('#b5e2e8', '#fae096', warmth);
  let bankC = mixHex('#d9c3a3', '#cca378', warmth);

  if (storm > 0) {
    skyTop = mixHex(skyTop, '#3b425c', storm * 0.88);
    skyBot = mixHex(skyBot, '#7c7e94', storm * 0.85);
    hillC = mixHex(hillC, '#4a4c63', storm * 0.88);
    riverTop = mixHex(riverTop, '#466178', storm * 0.85);
    riverBot = mixHex(riverBot, '#6b859c', storm * 0.85);
    bankC = mixHex(bankC, '#8a827d', storm * 0.85);
  }

  const sg = ctx.createLinearGradient(0, 0, 0, 960);
  sg.addColorStop(0, skyTop);
  sg.addColorStop(1, skyBot);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, 960);

  // Sun
  if (storm < 0.7) {
    const sunY = lerp(690, 520, warmth);
    ctx.save();
    ctx.globalAlpha = clamp((1 - storm) * 0.9);
    ctx.fillStyle = 'rgba(255, 224, 120, 0.25)';
    ctx.beginPath(); ctx.arc(760, sunY, 175, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd24c';
    ctx.beginPath(); ctx.arc(760, sunY, 102, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

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

  // River
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

  // Riverbank
  ctx.fillStyle = bankC;
  ctx.fillRect(0, 1180, W, H - 1180);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 1180); ctx.lineTo(W, 1180); ctx.stroke();

  // Grass tufts
  ctx.strokeStyle = 'rgba(35,31,32,0.4)';
  ctx.lineWidth = 3.5;
  for (const [gx, gy] of [[160, 1340], [340, 1590], [640, 1370], [890, 1620], [500, 1740]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy); ctx.lineTo(gx - 12, gy - 24);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 28);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 15, gy - 20);
    ctx.stroke();
  }

  // Banyan canopy & vines
  ctx.fillStyle = mixHex('#4e7a4f', '#4a7545', warmth);
  for (const [cx, cy, r] of [[120, 40, 190], [360, 20, 210], [640, 50, 185], [920, 30, 220]]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#3d2c20';
  ctx.lineWidth = 5;
  for (const [vx, vh] of [[140, 380], [290, 310], [490, 260], [740, 330], [930, 390]]) {
    ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx + Math.sin(t * 1.2 + vx) * 4, vh); ctx.stroke();
  }

  // Rain streaks during storm
  if (storm > 0.2) {
    ctx.save();
    ctx.strokeStyle = `rgba(220, 230, 255, ${storm * 0.35})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const rx = ((i * 97 + t * 140) % (W + 100)) - 50;
      const ry = ((i * 173 + t * 520) % 1200);
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 18, ry + 48); ctx.stroke();
    }
    ctx.restore();
  }

  // Glow particles
  ctx.fillStyle = 'rgba(255, 240, 180, 0.38)';
  for (let i = 0; i < 12; i++) {
    const px = (i * 197 + Math.sin(t * 0.7 + i) * 30) % W;
    const py = 650 + ((i * 113 - t * 18) % 620 + 620) % 620;
    ctx.beginPath(); ctx.arc(px, py, 3.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
}

function drawThumbnailCards() {
  const cards = [
    { x: 280, bg: '#f7e6b7', accent: '#b55612', line1: 'HỘI CHỊ EM', line2: 'VỮNG VÀNG' },
    { x: 800, bg: '#ffd6d6', accent: '#b8252a', line1: 'DỰA HẾT CHỒNG', line2: 'CHÔNG CHÊNH' },
  ];
  for (const c of cards) {
    const w = 468, h = 148, y = 620;
    const bx = c.x - w / 2, by = y - h / 2;
    ctx.save();
    ctx.fillStyle = c.bg;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(bx, by, w, h, 28); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = INK;
    ctx.font = '700 32px Cap, sans-serif';
    ctx.fillText(c.line1, c.x, y - 22);
    ctx.fillStyle = c.accent;
    ctx.font = '700 34px Cap, sans-serif';
    ctx.fillText(c.line2, c.x, y + 24);
    ctx.restore();
  }
}

function drawSpeechBubble(x, y, text, tailDir = 'down', bg = '#f7e6b7') {
  ctx.save();
  ctx.font = '700 38px Cap, sans-serif';
  const padX = 36;
  const tw = ctx.measureText(text).width;
  const bw = tw + padX * 2, bh = 86;
  const bx = x - bw / 2, by = y - bh / 2;
  ctx.fillStyle = bg; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 34); ctx.fill(); ctx.stroke();
  if (tailDir === 'down') {
    ctx.beginPath();
    ctx.moveTo(x - 16, by + bh - 2); ctx.lineTo(x - 4, by + bh + 34); ctx.lineTo(x + 18, by + bh - 2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 16, by + bh); ctx.lineTo(x - 4, by + bh + 34); ctx.lineTo(x + 18, by + bh);
    ctx.stroke();
  }
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 2);
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
  ctx.quadraticCurveTo(62, -110, 68, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c96f1a';
  ctx.beginPath();
  ctx.moveTo(-55, -75); ctx.lineTo(58, -10); ctx.lineTo(50, 5); ctx.lineTo(-62, -62); ctx.closePath(); ctx.fill();
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
    gender = 'woman',   // 'woman' | 'man'
    robe = '#c76b29',
    sash = '#e58a2d',
    pose = 'stand',     // 'stand' | 'kneel' | 'collapse' | 'lean'
    mood = 'calm',      // 'calm' | 'sad' | 'tired' | 'warm'
    hairColor = '#25262e',
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (pose === 'collapse') ctx.rotate(0.26);
  if (pose === 'lean') ctx.rotate(-0.14);

  const skin = '#d89f72';
  ctx.strokeStyle = INK; ctx.lineWidth = 5;

  // Lower body
  ctx.fillStyle = robe;
  if (pose === 'kneel' || pose === 'collapse') {
    ctx.beginPath(); ctx.ellipse(0, 0, 78, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(-40, -68, 80, 74, 16); ctx.fill(); ctx.stroke();
  }

  // Torso
  const ty = pose === 'kneel' || pose === 'collapse' ? -10 : -70;
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.roundRect(-44, ty - 92, 88, 96, 26);
  ctx.fill(); ctx.stroke();

  // Sash
  ctx.fillStyle = sash;
  ctx.fillRect(-43, ty - 20, 86, 18);
  ctx.strokeRect(-43, ty - 20, 86, 18);

  // Head
  const hy = ty - 138;
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, hy, 42, 46, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Hair
  ctx.fillStyle = hairColor;
  if (gender === 'woman') {
    // Soft bun + side hair
    ctx.beginPath(); ctx.arc(0, hy - 50, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hy - 8, 43, Math.PI * 1.0, Math.PI * 2.0); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, hy - 12, 42, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.stroke();
  }

  // Face
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4;
  if (mood === 'sad') {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 10); ctx.lineTo(-10, hy - 4);
    ctx.moveTo(22, hy - 10); ctx.lineTo(10, hy - 4);
    ctx.moveTo(-12, hy + 22); ctx.quadraticCurveTo(0, hy + 12, 12, hy + 22);
    ctx.stroke();
    // Tear drop
    ctx.fillStyle = '#7ec4cf';
    ctx.beginPath(); ctx.arc(-18, hy + 8, 5, 0, Math.PI * 2); ctx.fill();
  } else if (mood === 'tired') {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 4); ctx.lineTo(-10, hy - 4);
    ctx.moveTo(10, hy - 4); ctx.lineTo(22, hy - 4);
    ctx.moveTo(-10, hy + 20); ctx.lineTo(10, hy + 20);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-22, hy - 6); ctx.quadraticCurveTo(-15, hy - 1, -8, hy - 6);
    ctx.moveTo(8, hy - 6); ctx.quadraticCurveTo(15, hy - 1, 22, hy - 6);
    ctx.moveTo(-11, hy + 18); ctx.quadraticCurveTo(0, hy + 26, 11, hy + 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeartOrb(x, y, scale = 1, cracked = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = cracked ? '#ff9c9c' : '#ffd269';
  ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (cracked) {
    ctx.strokeStyle = '#9e2323'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -32); ctx.lineTo(6, -6); ctx.lineTo(-10, 10); ctx.lineTo(8, 34);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#e05a47';
    ctx.beginPath(); ctx.arc(0, 2, 16, 0, Math.PI * 2); ctx.fill();
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
  drawBackdrop(t);

  if (t < 7.55) {
    // Shot 1: Hook — Buddha on left + two contrasting wives + outcome cards
    drawThumbnailCards();
    drawBuddha(240, 1235, 0.92, t);
    drawPerson(575, 1245, 0.9, { gender: 'woman', robe: '#c76b29', sash: '#e58a2d', pose: 'stand', mood: 'warm' });
    drawPerson(835, 1260, 0.9, { gender: 'woman', robe: '#9e3232', sash: '#2f8a8a', pose: 'collapse', mood: 'sad' });
    if (t >= 2.2) drawSpeechBubble(830, 930, 'Sao lại gục?', 'down', '#ffd6d6');
  } else if (t < 16.5) {
    // Shot 2: Wife 1 places entire peace on husband's shoulder
    drawPerson(390, 1260, 1.05, { gender: 'woman', robe: '#9e3232', sash: '#2f8a8a', pose: 'lean', mood: 'warm' });
    drawPerson(690, 1260, 1.08, { gender: 'man', robe: '#52657a', sash: '#c9b38c', pose: 'stand', mood: 'calm' });
    drawHeartOrb(620, 995, 1.0, false);
    if (t >= 11.5) drawSpeechBubble(540, 780, 'Chỗ dựa duy nhất');
  } else if (t < 23.7) {
    // Shot 3: Impermanence — husband grows tired, orb cracks
    const droop = smooth(16.6, 20.5, t);
    drawPerson(370, 1260, 1.05, { gender: 'woman', robe: '#9e3232', sash: '#2f8a8a', pose: 'lean', mood: 'sad' });
    drawPerson(700 + droop * 35, 1260, 1.08, { gender: 'man', robe: '#52657a', sash: '#c9b38c', pose: 'stand', mood: 'tired' });
    drawHeartOrb(620, 995 + droop * 40, 1.0, true);
    drawSpeechBubble(700, 790, 'Vô thường...', 'down', '#ffd6d6');
  } else if (t < 34.4) {
    // Shot 4: Husband steps away, Wife 1 collapses in sorrow
    const away = smooth(23.9, 27.5, t);
    drawPerson(430, 1265, 1.08, { gender: 'woman', robe: '#9e3232', sash: '#2f8a8a', pose: 'collapse', mood: 'sad' });
    drawPerson(760 + away * 170, 1260, 1.0, { gender: 'man', robe: '#52657a', sash: '#c9b38c', pose: 'stand', mood: 'tired' });
    if (t >= 29.0) drawSpeechBubble(430, 860, 'Kỳ vọng quá lớn', 'down', '#ffd6d6');
  } else if (t < 40.8) {
    // Shot 5: Sunrise Turn — Wife 2 with husband AND wise sisterhood
    drawPerson(270, 1255, 0.95, { gender: 'man', robe: '#52657a', sash: '#c9b38c', pose: 'stand', mood: 'calm' });
    drawPerson(510, 1255, 1.02, { gender: 'woman', robe: '#c76b29', sash: '#e58a2d', pose: 'stand', mood: 'warm' });
    drawPerson(735, 1255, 0.95, { gender: 'woman', robe: '#4e7a4f', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    drawPerson(905, 1255, 0.92, { gender: 'woman', robe: '#2f8a8a', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    drawSpeechBubble(710, 820, 'Hội chị em thiện lành');
  } else if (t < 46.4) {
    // Shot 6: Buddha close-up teaching Upaddha Sutta (SN 45.2)
    drawBuddha(540, 1255, 1.42, t, { handUp: true });
    drawSpeechBubble(540, 740, 'Thiện tri thức');
  } else if (t < 56.0) {
    // Shot 7: Sisterhood holds space + inner refuge glow
    const ring = ((t - 46.4) * 0.65) % 1;
    ctx.strokeStyle = `rgba(255, 224, 120, ${1 - ring})`;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(540, 1110, 160 + ring * 190, 0, Math.PI * 2); ctx.stroke();

    drawPerson(280, 1255, 0.96, { gender: 'woman', robe: '#4e7a4f', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    drawPerson(540, 1255, 1.08, { gender: 'woman', robe: '#c76b29', sash: '#e58a2d', pose: 'stand', mood: 'warm' });
    drawPerson(800, 1255, 0.96, { gender: 'woman', robe: '#2f8a8a', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    if (t >= 51.0) drawSpeechBubble(540, 780, 'Nương tựa chính mình');
  } else {
    // Shot 8: Calm resolution — Buddha on left + balanced sisterhood
    drawBuddha(240, 1235, 0.92, t, { handUp: true });
    drawPerson(545, 1250, 0.92, { gender: 'woman', robe: '#c76b29', sash: '#e58a2d', pose: 'stand', mood: 'warm' });
    drawPerson(735, 1250, 0.88, { gender: 'woman', robe: '#4e7a4f', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    drawPerson(905, 1250, 0.88, { gender: 'woman', robe: '#2f8a8a', sash: '#f7e6b7', pose: 'stand', mood: 'warm' });
    drawSpeechBubble(660, 780, 'Đi qua giông bão cùng nhau', 'none');
  }

  drawSubtitles(t);
}

window.renderAt = renderScene;
