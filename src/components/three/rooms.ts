import { Color } from "three";
import { services } from "@/content/site";

export const ROOM_TEXTURES = services.rooms.map((r) => r.image);
export const ROOM_COLORS = services.rooms.map((r) => new Color(r.tint));

/** How present room `i` is (0…1) for a float room position. */
export function roomWeight(room: number, i: number) {
  return Math.max(0, 1 - Math.abs(room - i));
}

const tmp = new Color();

/** Accent tint at a float room position (smooth blend between neighbours). */
export function roomTint(room: number, out: Color) {
  const i = Math.min(Math.floor(room), ROOM_COLORS.length - 1);
  const f = room - i;
  out.copy(ROOM_COLORS[i]);
  if (f > 0 && i + 1 < ROOM_COLORS.length) out.lerp(tmp.copy(ROOM_COLORS[i + 1]), f);
  return out;
}
