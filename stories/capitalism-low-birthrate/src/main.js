// Editorial Systems-Explainer animation for capitalism-low-birthrate
const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, t) => { const u = clamp((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);

let PHRASES = [];
let DURATION = 91.86;

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

let C = {
  background: 'dark-grid',
  bgTop: '#0b0f19',
  bgBot: '#131b2e',
  gridColor: 'rgba(148, 163, 184, 0.06)',
  card: '#182238',
  cardBorder: '#2c3a57',
  text: '#f1f5f9',
  muted: '#94a3b8',
  cyan: '#38bdf8',
  amber: '#fbbf24',
  orange: '#ff9838',
  red: '#f43f5e',
  green: '#34d399',
};

window.ready = (async () => {
  await document.fonts.ready;
  const tpl = await fetch('./template.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}));
  if (tpl.theme) C = { ...C, ...tpl.theme };
  const words = await fetch('./audio/vo.words.json').then(r => r.json());
  PHRASES = groupWords(words);
  DURATION = Math.max(91.86, words[words.length - 1].e + 0.5);
  window.DURATION = DURATION;
})();

function drawStudioBackdrop(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgTop);
  g.addColorStop(1, C.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Subtle architectural grid
  ctx.strokeStyle = C.gridColor || 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1.5;
  const step = 90;
  for (let x = step; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = step; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  if (C.background === 'paper') {
    // Subtle deterministic paper grain flecks
    ctx.fillStyle = 'rgba(120, 95, 65, 0.055)';
    for (let i = 0; i < 160; i++) {
      const px = (i * 173 + 37) % W;
      const py = (i * 251 + 19) % H;
      ctx.fillRect(px, py, 3, 3);
    }
  } else {
    // Soft ambient radial glow for dark studio
    const rg = ctx.createRadialGradient(540, 740, 40, 540, 740, 620);
    rg.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
    rg.addColorStop(1, 'rgba(11, 15, 25, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 120, W, 1250);
  }
}

function drawStageHeader(t) {
  const stages = [
    { end: 5.3, label: '01 / ĐẶT VẤN ĐỀ' },
    { end: 26.0, label: '02 / MẶT TÍCH CỰC & TUỔI THỌ' },
    { end: 45.6, label: '03 / CÔNG NGHỆ & TIỀN LƯƠNG' },
    { end: 66.7, label: '04 / THỜI GIAN RIÊNG BỊ NUỐT CHỬNG' },
    { end: 71.8, label: '05 / THÁP DÂN SỐ THU HẸP' },
    { end: 999, label: '06 / HỆ QUẢ TOÀN CẦU' },
  ];
  const st = stages.find(s => t < s.end) || stages[stages.length - 1];

  ctx.save();
  // Pill tag
  ctx.font = '700 26px Cap, sans-serif';
  const tw = ctx.measureText(st.label).width;
  const bw = tw + 56;
  ctx.fillStyle = C.card;
  ctx.strokeStyle = C.cardBorder;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(540 - bw / 2, 130, bw, 56, 28);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = C.cyan;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.label, 540, 159);

  // Thin progress bar
  const barW = 760, bx = 160, by = 212;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.beginPath(); ctx.roundRect(bx, by, barW, 6, 3); ctx.fill();
  ctx.fillStyle = C.orange;
  ctx.beginPath(); ctx.roundRect(bx, by, barW * clamp(t / DURATION), 6, 3); ctx.fill();
  ctx.restore();
}

function drawNode(x, y, w, h, title, sub, accent = C.cyan, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = C.card;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 24); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.text;
  ctx.font = '700 34px Cap, sans-serif';
  ctx.fillText(title, x, sub ? y - 20 : y);
  if (sub) {
    ctx.fillStyle = accent;
    ctx.font = '700 28px Cap, sans-serif';
    ctx.fillText(sub, x, y + 26);
  }
  ctx.restore();
}

function drawArrowLine(x1, y1, x2, y2, prog = 1, color = C.muted) {
  if (prog <= 0.01) return;
  const cx = lerp(x1, x2, clamp(prog));
  const cy = lerp(y1, y2, clamp(prog));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(cx, cy); ctx.stroke();

  if (prog > 0.85) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-18, -10); ctx.lineTo(-18, 10); ctx.closePath();
    ctx.fill();
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
    ctx.strokeStyle = '#070a10';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = active ? '#ff9838' : '#ffffff';
    ctx.fillText(text, x, y);
    x += widths[i] + spaceW;
  }
  ctx.restore();
}

function renderScene(t) {
  ctx.clearRect(0, 0, W, H);
  drawStudioBackdrop(t);
  drawStageHeader(t);

  if (t < 5.30) {
    // 01: Hook — Causal link
    const p1 = easeOut(smooth(0.1, 1.0, t));
    const p2 = easeOut(smooth(1.0, 2.0, t));
    const p3 = easeOut(smooth(1.8, 3.0, t));
    drawNode(540, 490, 680, 150, 'CHỦ NGHĨA TƯ BẢN', 'Mở rộng sản xuất & tiêu dùng', C.cyan, p1);
    drawArrowLine(540, 580, 540, 740, p2, C.orange);
    drawNode(310, 860, 400, 160, 'TỶ LỆ SINH THẤP', 'Đáy tháp thu hẹp', C.red, p3);
    drawNode(770, 860, 400, 160, 'DÂN SỐ GIÀ HÓA', 'Tuổi thọ tăng cao', C.amber, p3);
  } else if (t < 16.60) {
    // 02a: Living wage -> 3 meals -> Consumer loop
    const p1 = easeOut(smooth(5.4, 7.0, t));
    const p2 = easeOut(smooth(9.0, 11.0, t));
    const p3 = easeOut(smooth(12.8, 14.5, t));
    drawNode(540, 460, 660, 145, 'LƯƠNG VỪA ĐỦ SỐNG', 'Tái tạo sức lao động mỗi ngày', C.cyan, p1);
    drawArrowLine(540, 545, 540, 650, p2, C.green);
    drawNode(540, 745, 660, 145, 'ĐẢM BẢO NGÀY 3 BỮA', 'Đáp ứng nhu cầu dinh dưỡng', C.green, p2);
    drawArrowLine(540, 830, 540, 935, p3, C.amber);
    drawNode(540, 1030, 660, 145, 'NGƯỜI TIÊU DÙNG', 'Thúc đẩy vòng quay thị trường', C.amber, p3);
  } else if (t < 26.00) {
    // 02b: Nutrition + Medicine -> Lifespan rises -> Aging
    const u = easeOut(smooth(17.0, 23.2, t));
    drawNode(300, 430, 380, 130, 'DINH DƯỠNG', 'Đầy đủ & ổn định', C.green, 1);
    drawNode(780, 430, 380, 130, 'Y HỌC TIẾN BỘ', 'Công nghệ chăm sóc', C.cyan, 1);

    // Chart box
    ctx.save();
    ctx.fillStyle = C.card; ctx.strokeStyle = C.cardBorder; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(140, 560, 800, 440, 28); ctx.fill(); ctx.stroke();

    ctx.fillStyle = C.muted; ctx.font = '700 28px Cap, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('TUỔI THỌ TRUNG BÌNH', 190, 620);

    // Animated rising curve
    ctx.strokeStyle = C.amber; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath();
    const steps = 40;
    for (let i = 0; i <= Math.floor(steps * u); i++) {
      const f = i / steps;
      const px = lerp(200, 880, f);
      const py = lerp(920, 670, Math.pow(f, 0.75));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = C.amber; ctx.font = '700 36px Cap, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('TĂNG CAO', 880, 625);
    ctx.restore();

    drawNode(540, 1110, 640, 120, 'DÂN SỐ BẮT ĐẦU GIÀ HÓA', 'Mặt tích cực của phát triển', C.amber, smooth(21.5, 23.5, t));
  } else if (t < 39.10) {
    // 03a: Competition & Tech Innovation -> Cut labor costs
    const p1 = easeOut(smooth(26.2, 29.0, t));
    const p2 = easeOut(smooth(31.8, 34.5, t));
    const p3 = easeOut(smooth(35.0, 38.0, t));
    drawNode(540, 450, 720, 145, 'CẠNH TRANH THỊ TRƯỜNG', 'Buộc phải giảm chi phí nhân công', C.orange, p1);
    drawArrowLine(420, 535, 310, 665, p2, C.muted);
    drawArrowLine(660, 535, 770, 665, p3, C.cyan);
    drawNode(300, 780, 400, 190, 'CẠNH TRANH', 'Giữa người lao động', C.muted, p2);
    drawNode(780, 780, 400, 190, 'ĐỔI MỚI CÔNG NGHỆ', 'Nguyên nhân chủ yếu', C.cyan, p3);
    drawNode(540, 1050, 660, 130, 'MỤC TIÊU: LƯƠNG THẤP HƠN', 'Để sản phẩm cạnh tranh hơn', C.red, p3);
  } else if (t < 45.60) {
    // 03b: Tech UP, Labor value & Wages DOWN
    const u = easeOut(smooth(39.3, 44.5, t));
    ctx.save();
    ctx.fillStyle = C.card; ctx.strokeStyle = C.cardBorder; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(120, 380, 840, 560, 28); ctx.fill(); ctx.stroke();

    // Tech curve UP
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= Math.floor(40 * u); i++) {
      const f = i / 40;
      const px = lerp(180, 900, f);
      const py = lerp(840, 460, Math.pow(f, 0.8));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Wage curve DOWN
    ctx.strokeStyle = C.red; ctx.lineWidth = 8;
    ctx.beginPath();
    for (let i = 0; i <= Math.floor(40 * u); i++) {
      const f = i / 40;
      const px = lerp(180, 900, f);
      const py = lerp(520, 860, Math.pow(f, 0.85));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.font = '700 30px Cap, sans-serif';
    ctx.fillStyle = C.cyan; ctx.textAlign = 'left';
    ctx.fillText('▲ NĂNG SUẤT CÔNG NGHỆ', 175, 435);
    ctx.fillStyle = C.red; ctx.textAlign = 'right';
    ctx.fillText('▼ GIÁ TRỊ SỨC LAO ĐỘNG', 905, 895);
    ctx.restore();

    drawNode(540, 1080, 680, 130, 'TIỀN LƯƠNG KÉO XUỐNG', 'Làm việc dễ hơn nhưng rẻ hơn', C.red, 1);
  } else if (t < 55.80) {
    // 04a: 24-hour donut chart — work + unpaid OT + side hustle eats private time
    const eat = easeOut(smooth(46.0, 54.5, t));
    const cx = 540, cy = 670, r = 220;
    ctx.save();
    // Base ring: Private time (green)
    ctx.lineWidth = 68;
    ctx.strokeStyle = C.green;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // Sleep arc (slate)
    ctx.strokeStyle = '#475569';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 0.5, Math.PI * 0.15); ctx.stroke();

    // Work + Overtime arc expanding from 33% to 62% of the ring
    const workSpan = lerp(Math.PI * 0.65, Math.PI * 1.25, eat);
    ctx.strokeStyle = C.red;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.15, Math.PI * 0.15 + workSpan); ctx.stroke();

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.text; ctx.font = '700 42px Cap, sans-serif';
    ctx.fillText('24 GIỜ', cx, cy - 22);
    ctx.fillStyle = C.red; ctx.font = '700 30px Cap, sans-serif';
    ctx.fillText('TĂNG CA & VIỆC PHỤ', cx, cy + 28);
    ctx.restore();

    drawNode(540, 1060, 740, 140, 'THỜI GIAN RIÊNG BỊ ĐEM BÁN', 'Để giữ nguyên mức sống cũ', C.orange, 1);
  } else if (t < 66.70) {
    // 04b: Free time (rest, relationships) swallowed -> no energy for kids
    const crush = easeOut(smooth(56.2, 62.5, t));
    drawNode(300, 480, 380, 140, 'NGHỈ NGƠI', 'Phục hồi sức lực', C.green, 1 - crush * 0.5);
    drawNode(780, 480, 380, 140, 'TÌNH CẢM', 'Vun đắp gia đình', C.cyan, 1 - crush * 0.5);
    drawArrowLine(300, 560, 470, 700, 1, C.red);
    drawArrowLine(780, 560, 610, 700, 1, C.red);
    drawNode(540, 780, 720, 150, 'GUỒNG MÁY TƯ BẢN', 'Nuốt chửng thời gian rảnh', C.red, 1);
    drawArrowLine(540, 865, 540, 975, smooth(62.6, 64.5, t), C.red);
    drawNode(540, 1075, 760, 145, 'KHÔNG CÒN SỨC NUÔI CON', 'Cạn kiệt thời gian & năng lượng', C.amber, smooth(62.6, 65.0, t));
  } else if (t < 71.80) {
    // 05: Shrinking Population Pyramid
    const shrink = easeOut(smooth(66.9, 71.0, t));
    ctx.save();
    ctx.fillStyle = C.card; ctx.strokeStyle = C.cardBorder; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(120, 360, 840, 760, 28); ctx.fill(); ctx.stroke();

    const ages = ['65+', '45–64', '25–44', '15–24', '0–14'];
    const baseW = [190, 310, 450, 580, 700];
    const targetW = [380, 460, 420, 290, 180];
    for (let i = 0; i < 5; i++) {
      const bw = lerp(baseW[i], targetW[i], shrink);
      const y = 450 + i * 112;
      ctx.fillStyle = i >= 3 ? C.red : i === 0 ? C.amber : C.cyan;
      ctx.beginPath(); ctx.roundRect(540 - bw / 2, y, bw, 82, 14); ctx.fill();
      ctx.fillStyle = '#0b0f19';
      ctx.font = '700 30px Cap, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ages[i], 540, y + 42);
    }
    ctx.fillStyle = C.text; ctx.font = '700 34px Cap, sans-serif';
    ctx.fillText('ĐÁY THÁP DÂN SỐ THU HẸP', 540, 1055);
    ctx.restore();
  } else if (t < 86.00) {
    // 06a: Japan/Korea vs France -> Global expansion
    const exp = easeOut(smooth(79.7, 84.5, t));
    drawNode(300, 560, 400, 250, 'NHẬT & HÀN', 'Phục tùng & phụ quyền', C.red, 1);
    drawNode(780, 560, 400, 250, 'PHÁP', 'Phản kháng giữ giờ riêng', C.cyan, 1);

    if (exp > 0.02) {
      ctx.save();
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.85 * exp})`;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(540, 560, 140 + exp * 340, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      drawNode(540, 960, 760, 160, 'TƯ BẢN BÀNH TRƯỚNG KHÔNG NGỪNG', 'Xảy ra ở mọi xã hội tư bản', C.orange, exp);
    }
  } else {
    // 06b: Final 4-step causal summary
    drawNode(540, 420, 740, 120, '01 · CÔNG NGHỆ & CẠNH TRANH', 'Giảm giá trị sức lao động', C.cyan, 1);
    drawArrowLine(540, 488, 540, 558, 1, C.muted);
    drawNode(540, 625, 740, 120, '02 · LƯƠNG GIẢM, TĂNG CA', 'Bán cả thời gian riêng tư', C.orange, 1);
    drawArrowLine(540, 693, 540, 763, 1, C.muted);
    drawNode(540, 830, 740, 120, '03 · ĐÁY THÁP DÂN SỐ THU HẸP', 'Ít sinh con & dân số già', C.red, 1);
    drawNode(540, 1040, 660, 130, 'HỆ QUẢ TẤT YẾU', null, C.amber, 1);
  }

  drawSubtitles(t);
}

window.renderAt = renderScene;
