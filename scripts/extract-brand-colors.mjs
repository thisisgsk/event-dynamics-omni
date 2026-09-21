/**
 * Samples the official logo and prints the brand yellow + brand white.
 * Ignores transparent and near-black pixels, splits the rest into "yellow" (saturated, hue 30–60°)
 * and "white" (low saturation, high lightness) clusters and reports the median of each.
 *
 *   node scripts/extract-brand-colors.mjs public/brand/logo.png
 */
import sharp from "sharp";

const file = process.argv[2] ?? "public/brand/logo.png";
const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const yellow = [];
const white = [];

for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 200) continue; // transparent / anti-aliased edge
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 60) continue; // near-black (ink / background)
  const l = (max + min) / 2 / 255;
  const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) % 6;
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;
    h = (h * 60 + 360) % 360;
  }
  if (s > 0.45 && h >= 30 && h <= 60) yellow.push([r, g, b]);
  else if (s < 0.12 && l > 0.85) white.push([r, g, b]);
}

const median = (px) => {
  if (!px.length) return null;
  const ch = [0, 1, 2].map((c) => px.map((p) => p[c]).sort((a, b) => a - b)[Math.floor(px.length / 2)]);
  return (
    "#" +
    ch
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
};

console.log(`Sampled ${info.width}×${info.height} (${yellow.length} yellow px, ${white.length} white px)`);
console.log("brand-yellow:", median(yellow));
console.log("brand-white: ", median(white));
