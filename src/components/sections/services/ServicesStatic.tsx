import Image from "next/image";
import { services } from "@/content/site";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** prefers-reduced-motion layout: the four rooms as calm, stacked panels (no pinning, no WebGL wipes). */
export function ServicesStatic() {
  return (
    <section id="services" aria-labelledby="services-static-title" className="relative py-28">
      <div className="container-site">
        <SectionHeading
          id="services-static-title"
          eyebrow={services.eyebrow}
          title={services.title}
          sub={services.sub}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {services.rooms.map((room) => (
            <article key={room.slug} className="relative isolate overflow-hidden rounded-card border border-line">
              <Image
                src={room.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="-z-10 object-cover"
              />
              <div className="absolute inset-0 -z-10 scrim-bottom" />
              <div className="flex min-h-[26rem] flex-col justify-end p-8">
                <p className="mb-3 eyebrow" style={{ color: room.tint }}>
                  Room {room.index}
                </p>
                <h3 className="font-display text-3xl font-bold">{room.title}</h3>
                <p className="mt-3 text-fg/80">{room.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {room.tags.map((t) => (
                    <li key={t} className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <MagneticButton href={`/services/${room.slug}`} variant="ghost" size="sm" cursorLabel={services.cta}>
                    {services.cta} →
                  </MagneticButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
