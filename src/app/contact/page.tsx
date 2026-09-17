import type { Metadata } from "next";
import { brand, contact } from "@/content/site";
import { Contact } from "@/components/sections/contact/Contact";
import { Footer } from "@/components/sections/Footer";
import { GuidePose } from "@/components/sections/GuidePose";

export const metadata: Metadata = {
  title: "Contact",
  description: `${contact.sub} Start planning your next event with ${brand.name}.`,
};

export default function ContactPage() {
  return (
    <>
      <GuidePose pose="CONTACT" />
      <main id="main">
        <Contact standalone />
      </main>
      <Footer />
    </>
  );
}
