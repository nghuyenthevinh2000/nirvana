import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const TPL = path.resolve(ROOT, '../../../../.agents/skills/video-editing/scripts/video_engine/templates/kinetic-explainer.template.json');
const tpl = fs.existsSync(TPL) ? JSON.parse(fs.readFileSync(TPL, 'utf8')) : {};
const theme = tpl.theme || {};

const types = { '.html': 'text/html', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(0);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Cap'; src: url('node_modules/@fontsource/montserrat/files/montserrat-vietnamese-700-normal.woff2') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'Cap'; src: url('node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2') format('woff2'); font-weight: 700; }
  html, body { margin: 0; overflow: hidden; }
</style></head><body><canvas id="c" width="1080" height="1920"></canvas></body></html>`;
fs.writeFileSync(path.join(ROOT, '.thumb.html'), html);

const chromeBin = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].find(p => fs.existsSync(p));
const browser = await chromium.launch({ ...(chromeBin ? { executablePath: chromeBin } : {}) });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://localhost:${server.address().port}/.thumb.html`);

await page.evaluate(async (C) => {
  await document.fonts.ready;
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1920;

  // Background matching template theme
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgTop || '#f8f4ec');
  g.addColorStop(1, C.bgBot || '#ede4d3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = C.gridColor || 'rgba(15, 23, 42, 0.05)';
  ctx.lineWidth = 1.5;
  for (let x = 90; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 90; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Center 1:1 safe zone (y: 420..1500)
  // 1. Kicker pill
  ctx.font = '700 30px Cap, sans-serif';
  const kicker = 'PHÂN TÍCH HỆ THỐNG · 6 GIAI ĐOẠN';
  const kw = ctx.measureText(kicker).width + 64;
  ctx.fillStyle = C.card || '#ffffff';
  ctx.strokeStyle = C.cyan || '#0284c7';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(540 - kw / 2, 465, kw, 64, 32); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.cyan || '#0284c7';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(kicker, 540, 498);

  // 2. Hook headline (<= 6 words, 2 lines, generous spacing for Vietnamese diacritics)
  ctx.font = '700 72px Cap, sans-serif';
  ctx.fillStyle = C.text || '#0f172a';
  ctx.fillText('TẠI SAO TƯ BẢN', 540, 625);
  ctx.fillStyle = C.red || '#e11d48';
  ctx.fillText('LÀM GIẢM TỶ LỆ SINH?', 540, 725);

  // 3. Focal visual: Shrinking Population Pyramid card
  ctx.fillStyle = C.card || '#ffffff';
  ctx.strokeStyle = C.cardBorder || '#cbd5e1';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(140, 815, 800, 625, 32); ctx.fill(); ctx.stroke();

  const tiers = [
    { label: '65+', w: 420, color: C.amber || '#d97706' },
    { label: '45–64', w: 500, color: C.cyan || '#0284c7' },
    { label: '25–44', w: 450, color: C.cyan || '#0284c7' },
    { label: '15–24', w: 300, color: C.red || '#e11d48' },
    { label: '0–14', w: 185, color: C.red || '#e11d48' },
  ];
  tiers.forEach((t, i) => {
    const y = 875 + i * 94;
    ctx.fillStyle = t.color;
    ctx.beginPath(); ctx.roundRect(540 - t.w / 2, y, t.w, 72, 14); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px Cap, sans-serif';
    ctx.fillText(t.label, 540, y + 38);
  });

  ctx.fillStyle = C.text || '#0f172a';
  ctx.font = '700 34px Cap, sans-serif';
  ctx.fillText('ĐÁY THÁP DÂN SỐ THU HẸP', 540, 1390);
}, theme);

await page.screenshot({ path: path.join(ROOT, 'thumbnail.png'), clip: { x: 0, y: 0, width: 1080, height: 1920 }, type: 'png' });
await browser.close();
server.close();
fs.unlinkSync(path.join(ROOT, '.thumb.html'));
console.log('Saved thumbnail.png');
