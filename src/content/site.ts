/**
 * All website copy lives here. Edit freely — components only read from this file.
 * Figures, client names, events and testimonials are sample content: replace them with real data.
 */

import { PALETTE } from "@/lib/animation/tokens";

export const brand = {
  name: "Event Dynamics",
  wordmark: "EVENT DYNAMICS",
  tagline: ["Engage", "Entertain", "Enrich"],
  email: "hello@eventdynamics.com",
  phone: "+91 98765 43210",
  address: "Mumbai · Dubai · Singapore",
  url: "https://eventdynamics.com",
} as const;

export const seo = {
  title: "Event Dynamics — Premium Event Management",
  description:
    "Event Dynamics designs and produces unforgettable corporate events, weddings, concerts and gala dinners. We bring your vision to life.",
} as const;

export const nav = {
  links: [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "Experiences", href: "#experiences" },
    { label: "Process", href: "#process" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Start Planning", href: "#contact" },
} as const;

export const preloader = {
  status: "Setting the stage",
} as const;

export const hero = {
  headline: "We Bring Your Vision To Life",
  subline: "Event Dynamics — crafting unforgettable experiences.",
  scrollHint: "Scroll to begin",
} as const;

export const about = {
  eyebrow: "01 — About",
  title: "Designed with intent. Delivered with precision.",
  body: [
    "Event Dynamics is a full-service event studio. Strategy, creative direction, production and hospitality sit under one roof, so every detail answers to a single vision.",
    "From a two-hundred-seat leadership summit to a three-day destination wedding, we choreograph each moment the way a director shapes a film: light, sound, space and story working as one.",
  ],
  stats: [
    { value: 850, suffix: "+", label: "Events Delivered" },
    { value: 42, suffix: "", label: "Cities" },
    { value: 600, suffix: "+", label: "Happy Clients" },
    { value: 12, suffix: "", label: "Years" },
  ],
  cta: { label: "Start Planning", href: "#contact" },
} as const;

export type Room = {
  slug: string;
  index: string;
  title: string;
  description: string;
  tags: [string, string, string];
  image: string;
  /** 3D glow / post-processing tint for this room — brand yellow/white palette only (see PALETTE). */
  tint: string;
  long: string[];
};

export const services = {
  eyebrow: "02 — Services",
  title: "The Four Rooms",
  sub: "Step through the portal. Every room is a world we build from the ground up.",
  cta: "Explore",
  rooms: [
    {
      slug: "corporate-events",
      index: "01",
      title: "Corporate Events",
      description: "Summits, launches and conferences staged with broadcast-grade production.",
      tags: ["Conferences", "Product Launches", "Leadership Summits"],
      image: "/rooms/room-01-corporate.webp",
      tint: PALETTE.warmWhite,
      long: [
        "We translate business goals into moments people remember: keynote staging, LED architecture, hybrid broadcast and delegate journeys that run to the second.",
        "One production team owns run-of-show, speaker management, AV engineering and on-site hospitality, so your leadership can focus on the message.",
      ],
    },
    {
      slug: "weddings-celebrations",
      index: "02",
      title: "Weddings & Celebrations",
      description: "Intimate vows to grand destination weekends, told in candlelight and bloom.",
      tags: ["Destination Weddings", "Décor & Florals", "Guest Hospitality"],
      image: "/rooms/room-02-weddings.webp",
      tint: PALETTE.yellowSoft,
      long: [
        "Every celebration begins with your story. We design aisles, mandaps and receptions that feel personal, then orchestrate the logistics so your family can simply be present.",
        "Venue scouting, floral design, lighting, entertainment, travel and guest care are managed end to end.",
      ],
    },
    {
      slug: "concerts-live-shows",
      index: "03",
      title: "Concerts & Live Shows",
      description: "Stages, lasers and sound systems engineered for crowds that never forget.",
      tags: ["Stage Design", "Lighting & Lasers", "Artist Management"],
      image: "/rooms/room-03-concerts.webp",
      tint: PALETTE.brandYellow,
      long: [
        "From club nights to stadium tours, we build the show around the artist: stage architecture, lighting programming, audio design and crowd flow.",
        "Our crews handle rigging, permits, safety and artist hospitality so the performance is the only thing anyone talks about.",
      ],
    },
    {
      slug: "gala-dinners",
      index: "04",
      title: "Gala Dinners",
      description: "Chandelier-lit evenings of fine dining, awards and effortless elegance.",
      tags: ["Awards Nights", "Fine Dining", "Luxury Décor"],
      image: "/rooms/room-04-gala.webp",
      tint: PALETTE.yellowLight,
      long: [
        "Black-tie evenings demand quiet perfection. We compose the room, the menu, the entertainment and the ceremony so every guest feels celebrated.",
        "Seating strategy, award show flow, culinary partners and décor are curated to a single, elegant brief.",
      ],
    },
  ] satisfies Room[],
} as const;

export const experiences = {
  eyebrow: "03 — Experiences",
  title: "Moments we have staged",
  sub: "A selection of recent productions. Drag through the reel.",
  items: [
    {
      title: "Horizon Leadership Summit",
      place: "Dubai",
      year: "2025",
      category: "Corporate",
      image: "/experiences/exp-01-summit.webp",
    },
    {
      title: "The Riviera Wedding Weekend",
      place: "Goa",
      year: "2025",
      category: "Wedding",
      image: "/experiences/exp-02-wedding.webp",
    },
    {
      title: "Neon Nights Festival",
      place: "Singapore",
      year: "2024",
      category: "Concert",
      image: "/experiences/exp-03-festival.webp",
    },
    {
      title: "Golden Hour Gala",
      place: "London",
      year: "2024",
      category: "Gala",
      image: "/experiences/exp-04-gala.webp",
    },
    {
      title: "Pulse Product Launch",
      place: "Bengaluru",
      year: "2024",
      category: "Corporate",
      image: "/experiences/exp-05-launch.webp",
    },
    {
      title: "Starlight Anniversary",
      place: "Udaipur",
      year: "2023",
      category: "Celebration",
      image: "/experiences/exp-06-anniversary.webp",
    },
  ],
} as const;

export const process = {
  eyebrow: "04 — Process",
  title: "From first idea to final encore",
  steps: [
    {
      index: "01",
      title: "Discover",
      body: "We listen first: goals, audience, budget and the feeling you want guests to leave with.",
    },
    {
      index: "02",
      title: "Design",
      body: "Concept, spatial design, run-of-show and a production plan you can see before it is built.",
    },
    {
      index: "03",
      title: "Produce",
      body: "Vendors, crews, technology and logistics orchestrated by one accountable team.",
    },
    {
      index: "04",
      title: "Celebrate",
      body: "Show day runs flawlessly while you enjoy it. Then we measure, learn and report back.",
    },
  ],
} as const;

export const work = {
  eyebrow: "05 — Work",
  title: "Trusted by teams who expect the extraordinary",
  clients: [
    "Northwind Capital",
    "Aurelia Hotels",
    "Helix Pharma",
    "Monarch Motors",
    "Solstice Records",
    "Vantage Systems",
    "Crescent Jewellers",
    "Orbit Telecom",
  ],
  testimonials: [
    {
      quote:
        "Event Dynamics turned a routine annual summit into the most talked-about day of our year. Flawless from rehearsal to encore.",
      name: "Ananya Mehra",
      role: "Chief Marketing Officer, Northwind Capital",
    },
    {
      quote:
        "Our wedding felt like us, only more magical. They handled three hundred guests across four days and we never saw a single problem.",
      name: "Rohan & Isabel",
      role: "Married in Goa",
    },
    {
      quote:
        "The stage build, the lasers, the crowd flow — the production value rivalled international tours at a fraction of the stress.",
      name: "Daniel Okafor",
      role: "Head of Live, Solstice Records",
    },
    {
      quote: "A black-tie evening with no rough edges. Our guests still mention the chandelier reveal a year later.",
      name: "Priya Raman",
      role: "Director of Events, Aurelia Hotels",
    },
  ],
} as const;

export const finale = {
  eyebrow: "06 — Let's talk",
  title: "Let's Create Something Unforgettable",
  cta: { label: "Start Planning", href: "#contact" },
} as const;

export const contact = {
  eyebrow: "07 — Contact",
  title: "Tell us about your event",
  sub: "Share a few details and a producer will reply within one business day.",
  eventTypes: ["Corporate Event", "Wedding & Celebration", "Concert & Live Show", "Gala Dinner", "Something Else"],
  fields: {
    name: "Full name",
    email: "Email address",
    eventType: "Event type",
    date: "Event date",
    guests: "Number of guests",
    message: "Tell us about your vision",
  },
  submit: "Send enquiry",
  sending: "Sending…",
  success: {
    title: "Thank you — your enquiry is in.",
    body: "A producer from Event Dynamics will be in touch within one business day.",
    again: "Send another enquiry",
  },
} as const;

export const footer = {
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
  quickLinks: [
    { label: "Services", href: "#services" },
    { label: "Experiences", href: "#experiences" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  backToTop: "Back to top",
  legal: "All rights reserved.",
} as const;

export const ui = {
  sound: { on: "Sound on", off: "Sound off" },
  menu: { open: "Open menu", close: "Close menu" },
  roomRail: "Service rooms",
  backHome: "Back to home",
} as const;
