"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Cursor } from "@/components/ui/Cursor";
import { Navbar } from "@/components/ui/Navbar";
import { Preloader } from "@/components/ui/Preloader";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SmoothScroll } from "./SmoothScroll";
import { SoundProvider } from "./SoundProvider";
import { TransitionProvider } from "./TransitionProvider";

// The single WebGL canvas: client-only, code-split, persists across route changes.
const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SoundProvider>
      <SmoothScroll>
        <TransitionProvider>
          <Experience />
          <Preloader />
          <ScrollProgress />
          <div id="content" className="relative z-10">
            <a
              href="#main"
              className="sr-only z-[100] rounded-full bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
            >
              Skip to content
            </a>
            <Navbar />
            {children}
          </div>
          <div aria-hidden className="grain" />
          <Cursor />
        </TransitionProvider>
      </SmoothScroll>
    </SoundProvider>
  );
}
