/**
 * Generates src/app/icon.svg and src/app/apple-icon.png from the monogram paths in src/lib/brand/logo.ts.
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("src/lib/brand/logo.ts", "utf8");
const pick = (name) => {
  const block = src.split(`export const ${name} =`)[1].split(";")[0];
  return [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]).join("");
};
const E = pick("PATH_E");
const D = pick("PATH_D");

const icon = (
  size,
  radius,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#07070A"/>
  <g transform="translate(${size * 0.14} ${size * 0.2}) scale(${(size * 0.72) / 620})">
    <path fill-rule="evenodd" fill="#EBB92E" d="${E}"/>
    <path fill="#F4F3EF" d="${D}"/>
  </g>
</svg>`;

writeFileSync("src/app/icon.svg", icon(64, 14));
await sharp(Buffer.from(icon(180, 36)))
  .png()
  .toFile("src/app/apple-icon.png");
console.log("✓ icon.svg, apple-icon.png");
