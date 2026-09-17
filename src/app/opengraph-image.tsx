import { ImageResponse } from "next/og";
import { brand, hero } from "@/content/site";
import { MONOGRAM_VIEWBOX, PATH_D, PATH_E } from "@/lib/brand/logo";

export const alt = `${brand.name} — ${hero.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "radial-gradient(circle at 75% 30%, #2a1a4a 0%, #0E0E14 45%, #07070A 100%)",
        color: "#F4F3EF",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <svg width={150} height={121} viewBox={`0 0 ${MONOGRAM_VIEWBOX.width} ${MONOGRAM_VIEWBOX.height}`}>
          <path fillRule="evenodd" fill="#EBB92E" d={PATH_E} />
          <path fill="#F4F3EF" d={PATH_D} />
        </svg>
        <div style={{ width: 3, height: 110, background: "#EBB92E" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: 6,
            lineHeight: 1,
          }}
        >
          <span>EVENT</span>
          <span>DYNAMICS</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.02, maxWidth: 900 }}>
          {hero.headline}
        </div>
        <div
          style={{
            marginTop: 28,
            height: 6,
            width: 360,
            borderRadius: 3,
            background: "linear-gradient(90deg, #22E4FF, #8B5CF6, #FF2BD6)",
          }}
        />
        <div style={{ marginTop: 26, fontSize: 28, color: "#A7A6B3", letterSpacing: 8 }}>
          ENGAGE · ENTERTAIN · ENRICH
        </div>
      </div>
    </div>,
    size,
  );
}
