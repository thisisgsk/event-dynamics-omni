import type { Room } from "@/content/site";
import { services } from "@/content/site";
import { MagneticButton } from "@/components/ui/MagneticButton";

/** Identical UI treatment for every room. Children tagged `.room-reveal` share one stagger. */
export function RoomOverlay({ room, i }: { room: Room; i: number }) {
  return (
    <article
      data-room={i}
      aria-labelledby={`room-title-${i}`}
      className="room-overlay invisible absolute inset-x-0 bottom-0 pb-14 md:pb-20"
    >
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="room-reveal mb-5 flex items-center gap-3 eyebrow !text-brand-yellow">
            <span aria-hidden className="h-px w-8 bg-brand-yellow" />
            Room {room.index}
          </p>
          <h3 id={`room-title-${i}`} className="room-reveal display-lg text-balance">
            {room.title}
          </h3>
          <p className="room-reveal mt-5 max-w-lg text-base text-fg/80 md:text-lg">{room.description}</p>
          <ul className="room-reveal mt-7 flex flex-wrap gap-2" aria-label="Highlights">
            {room.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs tracking-wide text-fg/90 backdrop-blur-md md:text-sm"
              >
                <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-yellow align-middle" />
                {tag}
              </li>
            ))}
          </ul>
          <div className="room-reveal mt-9">
            <MagneticButton href={`/services/${room.slug}`} variant="ghost" cursorLabel={services.cta}>
              {services.cta} <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </article>
  );
}
