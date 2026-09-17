/**
 * Generates stylised placeholder artwork for the four Service rooms and the Experiences gallery.
 * Replace the files in /public/rooms and /public/experiences with real photography (same filenames).
 *   node scripts/generate-placeholders.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const defs = (extra = "") => `
<defs>
  <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="blur70"><feGaussianBlur stdDeviation="70"/></filter>
  ${extra}
</defs>`;

function bokeh(w, h, n, colors, minR, maxR, yMin = 0, yMax = 1, opacity = [0.15, 0.6]) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const r = minR + rnd() * (maxR - minR);
    s += `<circle cx="${rnd() * w}" cy="${h * (yMin + rnd() * (yMax - yMin))}" r="${r}" fill="${pick(colors)}" opacity="${opacity[0] + rnd() * (opacity[1] - opacity[0])}" filter="url(#${r > 18 ? "blur12" : "blur4"})"/>`;
  }
  return s;
}

function crowd(w, h, y, color, n, scale = 1) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = (i / n) * w + rnd() * 30;
    const hh = (60 + rnd() * 40) * scale;
    const hy = y - hh * 0.2 + rnd() * 20;
    s += `<ellipse cx="${x}" cy="${hy}" rx="${16 * scale}" ry="${20 * scale}" fill="${color}"/>`;
    s += `<rect x="${x - 32 * scale}" y="${hy + 14 * scale}" width="${64 * scale}" height="${h - hy}" rx="${26 * scale}" fill="${color}"/>`;
    if (rnd() > 0.82)
      s += `<path d="M${x + 18 * scale} ${hy + 20 * scale} L${x + 40 * scale} ${hy - 90 * scale}" stroke="${color}" stroke-width="${12 * scale}" stroke-linecap="round"/>`;
  }
  return s;
}

/* ───────────── Room 01 — Corporate (futuristic conference hall, cyan screens) ───────────── */
function corporate(w, h) {
  const horizon = h * 0.52;
  let lines = "";
  for (let i = -14; i <= 14; i++)
    lines += `<line x1="${w / 2}" y1="${horizon}" x2="${w / 2 + i * 180}" y2="${h}" stroke="#22D3EE" stroke-opacity="0.12" stroke-width="2"/>`;
  for (let i = 0; i < 9; i++) {
    const y = horizon + Math.pow(i / 8, 2) * (h - horizon);
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#22D3EE" stroke-opacity="${0.04 + i * 0.012}" stroke-width="2"/>`;
  }
  let bars = "";
  for (let i = 0; i < 26; i++) {
    const bh = 30 + rnd() * 170;
    bars += `<rect x="${w * 0.3 + i * 30}" y="${h * 0.42 - bh}" width="16" height="${bh}" fill="#67E8F9" opacity="${0.35 + rnd() * 0.5}"/>`;
  }
  let ceiling = "";
  for (let i = 0; i < 7; i++) {
    const y = h * (0.05 + i * 0.045);
    const inset = i * 90;
    ceiling += `<rect x="${inset + 120}" y="${y}" width="${w - (inset + 120) * 2}" height="6" rx="3" fill="#A5F3FC" opacity="${0.55 - i * 0.06}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(`
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020617"/><stop offset="0.5" stop-color="#062435"/><stop offset="1" stop-color="#01060C"/></linearGradient>
    <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E7490"/><stop offset="0.5" stop-color="#22D3EE"/><stop offset="1" stop-color="#1E3A8A"/></linearGradient>`)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${ceiling}
  <ellipse cx="${w / 2}" cy="${h * 0.32}" rx="${w * 0.42}" ry="${h * 0.22}" fill="#22D3EE" opacity="0.25" filter="url(#blur70)"/>
  <path d="M${w * 0.18} ${h * 0.14} Q${w / 2} ${h * 0.08} ${w * 0.82} ${h * 0.14} L${w * 0.8} ${h * 0.47} Q${w / 2} ${h * 0.43} ${w * 0.2} ${h * 0.47} Z" fill="url(#scr)" opacity="0.9"/>
  <path d="M${w * 0.18} ${h * 0.14} Q${w / 2} ${h * 0.08} ${w * 0.82} ${h * 0.14} L${w * 0.8} ${h * 0.47} Q${w / 2} ${h * 0.43} ${w * 0.2} ${h * 0.47} Z" fill="none" stroke="#CFFAFE" stroke-width="3" opacity="0.7"/>
  ${bars}
  <circle cx="${w * 0.27}" cy="${h * 0.28}" r="70" fill="none" stroke="#ECFEFF" stroke-width="10" stroke-dasharray="300 140" opacity="0.8"/>
  <rect x="${w * 0.64}" y="${h * 0.19}" width="${w * 0.12}" height="14" rx="7" fill="#ECFEFF" opacity="0.8"/>
  <rect x="${w * 0.64}" y="${h * 0.23}" width="${w * 0.08}" height="10" rx="5" fill="#ECFEFF" opacity="0.5"/>
  <rect x="${w * 0.3}" y="${h * 0.5}" width="${w * 0.4}" height="${h * 0.035}" fill="#0B1220"/>
  <rect x="${w * 0.47}" y="${h * 0.44}" width="${w * 0.06}" height="${h * 0.06}" rx="6" fill="#0F172A" stroke="#22D3EE" stroke-opacity="0.6"/>
  ${lines}
  ${bokeh(w, h, 40, ["#22D3EE", "#67E8F9", "#3B82F6"], 3, 10, 0.1, 0.5, [0.2, 0.7])}
  ${crowd(w, h, h * 0.8, "#01040A", 22, 1.25)}
  ${crowd(w, h, h * 0.92, "#000205", 16, 1.6)}
</svg>`;
}

/* ───────────── Room 02 — Weddings (floral garden aisle, candlelight gold) ───────────── */
function wedding(w, h) {
  const vx = w / 2;
  const vy = h * 0.45;
  let arches = "";
  for (let i = 0; i < 6; i++) {
    const t = 1 - i / 6;
    const aw = w * 0.55 * t + 80;
    const ah = h * 0.7 * t + 60;
    const y = vy + (h - vy) * t * 0.95;
    const flowers = [];
    for (let k = 0; k < 40; k++) {
      const a = Math.PI + (k / 39) * Math.PI;
      const fx = vx + Math.cos(a) * aw * 0.5;
      const fy = y - ah * 0.55 + Math.sin(a) * ah * 0.45 + ah * 0.1;
      flowers.push(
        `<circle cx="${fx}" cy="${fy}" r="${(14 + rnd() * 16) * t + 3}" fill="${pick(["#FBCFE8", "#FFF7ED", "#FDE68A", "#F9A8D4", "#FFFFFF"])}" opacity="${0.55 + rnd() * 0.4}"/>`,
      );
    }
    arches +=
      `<path d="M${vx - aw / 2} ${y} L${vx - aw / 2} ${y - ah * 0.55} A${aw / 2} ${ah * 0.45} 0 0 1 ${vx + aw / 2} ${y - ah * 0.55} L${vx + aw / 2} ${y}" fill="none" stroke="#FDE68A" stroke-opacity="${0.25 + t * 0.3}" stroke-width="${4 * t + 1}"/>` +
      flowers.join("");
  }
  let candles = "";
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const y = vy + (h - vy) * Math.pow(t, 1.5);
    const off = w * 0.05 + w * 0.3 * Math.pow(t, 1.5);
    [vx - off, vx + off].forEach((x) => {
      const s = 0.3 + t * 1.4;
      candles += `<circle cx="${x}" cy="${y - 40 * s}" r="${38 * s}" fill="#F59E0B" opacity="0.35" filter="url(#blur12)"/>`;
      candles += `<rect x="${x - 7 * s}" y="${y - 30 * s}" width="${14 * s}" height="${34 * s}" rx="3" fill="#FFF7ED" opacity="0.9"/>`;
      candles += `<ellipse cx="${x}" cy="${y - 38 * s}" rx="${4 * s}" ry="${9 * s}" fill="#FFE8A3"/>`;
    });
  }
  let string = "";
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 30; i++) {
      const x = (i / 29) * w;
      const y = h * (0.08 + r * 0.07) + Math.sin((i / 29) * Math.PI) * 60;
      string += `<circle cx="${x}" cy="${y}" r="4" fill="#FFE8A3"/><circle cx="${x}" cy="${y}" r="16" fill="#FBBF24" opacity="0.3" filter="url(#blur4)"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(`
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C1024"/><stop offset="0.45" stop-color="#5B2A2E"/><stop offset="0.6" stop-color="#2A1A14"/><stop offset="1" stop-color="#0C0806"/></linearGradient>
    <linearGradient id="aisle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE68A" stop-opacity="0.1"/><stop offset="1" stop-color="#FFF7ED" stop-opacity="0.55"/></linearGradient>`)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <ellipse cx="${vx}" cy="${vy}" rx="${w * 0.35}" ry="${h * 0.2}" fill="#FDBA74" opacity="0.4" filter="url(#blur70)"/>
  ${bokeh(w, h, 50, ["#FBBF24", "#FDE68A", "#F9A8D4"], 8, 40, 0, 0.5, [0.1, 0.4])}
  ${string}
  <path d="M${vx - 20} ${vy} L${vx + 20} ${vy} L${vx + w * 0.22} ${h} L${vx - w * 0.22} ${h} Z" fill="url(#aisle)"/>
  ${arches}
  ${candles}
  ${bokeh(w, h, 30, ["#FDE68A", "#FFFFFF"], 2, 6, 0.4, 1, [0.4, 0.9])}
</svg>`;
}

/* ───────────── Room 03 — Concerts (stage lasers, magenta / green) ───────────── */
function concert(w, h) {
  const stageY = h * 0.6;
  let lasers = "";
  const origins = [0.15, 0.3, 0.5, 0.7, 0.85];
  origins.forEach((o, i) => {
    for (let k = 0; k < 5; k++) {
      const ang = -Math.PI / 2 + (k - 2) * 0.28 + (i - 2) * 0.12;
      const len = h * 1.1;
      const x2 = w * o + Math.cos(ang) * len;
      const y2 = stageY - 60 + Math.sin(ang) * len;
      const c = (i + k) % 2 === 0 ? "#FF2BD6" : "#39FF88";
      lasers += `<line x1="${w * o}" y1="${stageY - 60}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="10" opacity="0.35" filter="url(#blur12)"/>`;
      lasers += `<line x1="${w * o}" y1="${stageY - 60}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.5" opacity="0.9"/>`;
    }
  });
  let beams = "";
  [0.1, 0.35, 0.65, 0.9].forEach((o, i) => {
    beams += `<path d="M${w * o} 0 L${w * o - 260 + i * 60} ${stageY} L${w * o + 260 + i * 40} ${stageY} Z" fill="url(#beam)" opacity="0.5"/>`;
  });
  let rig = "";
  for (let i = 0; i < 16; i++)
    rig += `<circle cx="${w * 0.1 + i * ((w * 0.8) / 15)}" cy="${h * 0.08}" r="12" fill="#FFFFFF" opacity="0.9"/><circle cx="${w * 0.1 + i * ((w * 0.8) / 15)}" cy="${h * 0.08}" r="40" fill="${i % 2 ? "#FF2BD6" : "#A78BFA"}" opacity="0.5" filter="url(#blur12)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(`
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0014"/><stop offset="0.55" stop-color="#2A0A3A"/><stop offset="1" stop-color="#020003"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D5FF" stop-opacity="0.7"/><stop offset="1" stop-color="#C026D3" stop-opacity="0"/></linearGradient>`)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="0" y="${h * 0.06}" width="${w}" height="8" fill="#1F1B2E"/>
  ${beams}
  <ellipse cx="${w / 2}" cy="${stageY - 80}" rx="${w * 0.4}" ry="${h * 0.18}" fill="#FF2BD6" opacity="0.35" filter="url(#blur70)"/>
  ${lasers}
  ${rig}
  <rect x="${w * 0.1}" y="${stageY - 40}" width="${w * 0.8}" height="${h * 0.08}" fill="#0B0512"/>
  <rect x="${w * 0.1}" y="${stageY - 44}" width="${w * 0.8}" height="4" fill="#FF2BD6" opacity="0.8"/>
  ${bokeh(w, h, 60, ["#FF2BD6", "#39FF88", "#A78BFA", "#FFFFFF"], 2, 8, 0.05, 0.6, [0.3, 0.9])}
  ${crowd(w, h, h * 0.78, "#050008", 26, 1.1)}
  ${crowd(w, h, h * 0.9, "#000000", 18, 1.5)}
</svg>`;
}

/* ───────────── Room 04 — Gala (chandelier ballroom, champagne gold) ───────────── */
function gala(w, h) {
  const cx = w / 2;
  let chandelier = "";
  for (let ring = 0; ring < 5; ring++) {
    const rx = 120 + ring * 90;
    const y = h * 0.14 + ring * 42;
    chandelier += `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${26 + ring * 6}" fill="none" stroke="#F3D9A4" stroke-width="3" opacity="0.8"/>`;
    const drops = 12 + ring * 6;
    for (let k = 0; k < drops; k++) {
      const a = (k / drops) * Math.PI * 2;
      const x = cx + Math.cos(a) * rx;
      const yy = y + Math.sin(a) * (26 + ring * 6);
      chandelier += `<line x1="${x}" y1="${yy}" x2="${x}" y2="${yy + 30 + rnd() * 30}" stroke="#FFF7E0" stroke-width="2" opacity="0.7"/><circle cx="${x}" cy="${yy + 34}" r="4" fill="#FFFBEB"/>`;
    }
  }
  let tables = "";
  for (let row = 0; row < 4; row++) {
    const y = h * (0.62 + row * 0.1);
    const s = 0.6 + row * 0.35;
    const n = 6 - row;
    for (let i = 0; i < n; i++) {
      const x = w * ((i + 0.5) / n) + (row % 2) * 40;
      tables += `<ellipse cx="${x}" cy="${y}" rx="${110 * s}" ry="${28 * s}" fill="#E6D6B8" opacity="0.7"/>`;
      tables += `<rect x="${x - 110 * s}" y="${y}" width="${220 * s}" height="${60 * s}" fill="#6B5A45" opacity="0.8"/>`;
      tables += `<circle cx="${x}" cy="${y - 30 * s}" r="${30 * s}" fill="#FBBF24" opacity="0.45" filter="url(#blur12)"/>`;
      tables += `<rect x="${x - 3 * s}" y="${y - 50 * s}" width="${6 * s}" height="${40 * s}" fill="#F3D9A4"/>`;
    }
  }
  let columns = "";
  [0.06, 0.2, 0.8, 0.94].forEach((o) => {
    columns += `<rect x="${w * o - 40}" y="${h * 0.1}" width="80" height="${h * 0.6}" fill="#2B1810" opacity="0.8"/><rect x="${w * o - 50}" y="${h * 0.1}" width="100" height="20" fill="#C9A66B" opacity="0.5"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(`
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140806"/><stop offset="0.45" stop-color="#3B1A12"/><stop offset="1" stop-color="#0A0504"/></linearGradient>`)}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${columns}
  <ellipse cx="${cx}" cy="${h * 0.25}" rx="${w * 0.35}" ry="${h * 0.25}" fill="#F3D9A4" opacity="0.35" filter="url(#blur70)"/>
  <line x1="${cx}" y1="0" x2="${cx}" y2="${h * 0.14}" stroke="#C9A66B" stroke-width="4"/>
  ${chandelier}
  ${bokeh(w, h, 90, ["#F3D9A4", "#FDE68A", "#FFFBEB"], 2, 26, 0, 0.7, [0.15, 0.7])}
  ${tables}
</svg>`;
}

const ROOMS = [
  ["room-01-corporate", corporate],
  ["room-02-weddings", wedding],
  ["room-03-concerts", concert],
  ["room-04-gala", gala],
];

const EXPERIENCES = [
  ["exp-01-summit", corporate, 11],
  ["exp-02-wedding", wedding, 23],
  ["exp-03-festival", concert, 37],
  ["exp-04-gala", gala, 41],
  ["exp-05-launch", corporate, 53, 70],
  ["exp-06-anniversary", wedding, 67, -40],
];

mkdirSync("public/rooms", { recursive: true });
mkdirSync("public/experiences", { recursive: true });

for (const [name, fn] of ROOMS) {
  seed = 7 + name.length;
  await sharp(Buffer.from(fn(1920, 1080)))
    .webp({ quality: 84 })
    .toFile(`public/rooms/${name}.webp`);
  console.log("✓ rooms/" + name);
}

for (const [name, fn, s, hue = 0] of EXPERIENCES) {
  seed = s;
  // Render wide, then crop a portrait 4:5 frame from a seeded horizontal offset
  const buf = await sharp(Buffer.from(fn(1920, 1200)))
    .png()
    .toBuffer();
  const left = Math.floor(rnd() * (1920 - 960));
  await sharp(buf)
    .modulate({ hue })
    .flop(hue !== 0)
    .extract({ left, top: 0, width: 960, height: 1200 })
    .webp({ quality: 82 })
    .toFile(`public/experiences/${name}.webp`);
  console.log("✓ experiences/" + name);
}
