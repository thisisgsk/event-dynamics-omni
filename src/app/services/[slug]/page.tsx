import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { brand, services, ui } from "@/content/site";
import { Footer } from "@/components/sections/Footer";
import { GuidePose } from "@/components/sections/GuidePose";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TransitionLink } from "@/components/ui/TransitionLink";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const room = services.rooms.find((r) => r.slug === slug);
  if (!room) return {};
  return {
    title: room.title,
    description: `${room.description} ${brand.name} designs and produces ${room.title.toLowerCase()}.`,
    openGraph: { images: [{ url: room.image, width: 1920, height: 1080, alt: room.title }] },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const index = services.rooms.findIndex((r) => r.slug === slug);
  if (index < 0) notFound();
  const room = services.rooms[index];
  const next = services.rooms[(index + 1) % services.rooms.length];

  return (
    <>
      <GuidePose pose="SUBPAGE" />
      <main id="main">
        <section
          aria-labelledby="service-title"
          className="relative isolate flex min-h-svh items-end overflow-hidden pt-32 pb-16 md:pb-24"
        >
          <Image src={room.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-45" />
          <div aria-hidden className="absolute inset-0 -z-10 scrim-bottom" />
          <div aria-hidden className="absolute inset-0 -z-10 scrim-left" />
          <div className="container-site">
            <TransitionLink
              href="/#services"
              className="mb-10 inline-flex items-center gap-2 eyebrow hover:text-fg"
              cursorLabel="Back"
            >
              ← {ui.backHome}
            </TransitionLink>
            <SectionHeading
              id="service-title"
              as="h1"
              size="xl"
              eyebrow={`Room ${room.index}`}
              title={room.title}
              sub={room.description}
              titleClassName="max-w-5xl"
            />
            <ul className="mt-8 flex flex-wrap gap-2">
              {room.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm backdrop-blur-md"
                >
                  <span
                    aria-hidden
                    className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{ background: room.tint }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label={`About ${room.title}`} className="relative py-24 md:py-32">
          <div className="container-site grid-12 gap-y-10">
            <div className="col-span-12 space-y-6 text-lg leading-relaxed text-fg/85 md:col-span-7 md:text-xl">
              {room.long.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <GlassCard className="p-8">
                <p className="eyebrow">Plan with {brand.name}</p>
                <p className="mt-4 font-display text-2xl font-bold">Ready to shape your {room.title.toLowerCase()}?</p>
                <div className="mt-8">
                  <MagneticButton href="/contact" variant="glow" cursorLabel="Plan">
                    Start Planning →
                  </MagneticButton>
                </div>
              </GlassCard>
            </div>
          </div>
          <div className="container-site mt-24 border-t border-line pt-10">
            <TransitionLink
              href={`/services/${next.slug}`}
              className="group flex items-end justify-between gap-6"
              cursorLabel="Next"
            >
              <span>
                <span className="eyebrow">Next room · {next.index}</span>
                <span className="mt-3 block display-lg transition-colors group-hover:text-gold">{next.title}</span>
              </span>
              <span
                aria-hidden
                className="text-4xl transition-transform duration-(--duration-ui) group-hover:translate-x-2"
              >
                →
              </span>
            </TransitionLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
