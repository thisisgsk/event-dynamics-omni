"use client";

import { useRef } from "react";
import { brand, contact } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, SCRUB } from "@/lib/animation/tokens";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "./ContactForm";

export function Contact({ standalone = false }: { standalone?: boolean }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
        gsap.from(".contact-form", {
          y: 80,
          autoAlpha: 0,
          ease: EASE.none,
          scrollTrigger: { id: "contact", trigger: section.current, start: "top 75%", end: "top 20%", scrub: SCRUB },
        });
        gsap.from(".contact-detail", {
          y: 24,
          autoAlpha: 0,
          stagger: 0.1,
          ease: EASE.none,
          scrollTrigger: { trigger: ".contact-details", start: "top 90%", end: "top 60%", scrub: SCRUB },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  const details = [
    { label: "Email", value: brand.email, href: `mailto:${brand.email}` },
    { label: "Phone", value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, "")}` },
    { label: "Studios", value: brand.address },
  ];

  return (
    <section
      id="contact"
      ref={section}
      aria-labelledby="contact-title"
      className={standalone ? "relative pt-36 pb-24 md:pt-44" : "relative py-28 md:py-40"}
    >
      <div className="container-site grid-12 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <SectionHeading
            id="contact-title"
            as={standalone ? "h1" : "h2"}
            eyebrow={contact.eyebrow}
            title={contact.title}
            sub={contact.sub}
          />
          <dl className="contact-details mt-12 space-y-6">
            {details.map((d) => (
              <div key={d.label} className="contact-detail">
                <dt className="eyebrow text-[0.65rem]">{d.label}</dt>
                <dd className="mt-1 text-lg">
                  {d.href ? (
                    <a
                      href={d.href}
                      className="underline-offset-4 transition-colors hover:text-brand-yellow hover:underline"
                      data-cursor="Write"
                    >
                      {d.value}
                    </a>
                  ) : (
                    d.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="contact-form col-span-12 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
