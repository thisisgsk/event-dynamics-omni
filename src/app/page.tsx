import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/contact/Contact";
import { Experiences } from "@/components/sections/Experiences";
import { Finale } from "@/components/sections/Finale";
import { Footer } from "@/components/sections/Footer";
import { GuideTimeline } from "@/components/sections/GuideTimeline";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/services/Services";
import { Testimonials } from "@/components/sections/Testimonials";

/** Home: one continuous film. Section order matters — pins are created top to bottom. */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Experiences />
        <Process />
        <Testimonials />
        <Finale />
        <Contact />
      </main>
      <Footer />
      {/* Must mount last: it reads the pixel positions of every section trigger above */}
      <GuideTimeline />
    </>
  );
}
