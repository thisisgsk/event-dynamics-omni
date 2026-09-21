"use client";

import { motion } from "motion/react";
import { services, ui } from "@/content/site";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

type Props = { active: number; onSelect: (i: number) => void };

/** Side progress rail 01–04. Keyboard accessible; clicking scrolls to that room. */
export function RoomRail({ active, onSelect }: Props) {
  const { tick } = useSound();

  return (
    <nav
      aria-label={ui.roomRail}
      className="room-rail invisible absolute top-24 right-[var(--gutter)] z-20 md:top-1/2 md:-translate-y-1/2"
    >
      <ol className="flex flex-col items-end gap-1">
        {services.rooms.map((room, i) => {
          const isActive = i === active;
          return (
            <li key={room.slug}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                onMouseEnter={tick}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Room ${room.index}: ${room.title}`}
                data-cursor="View"
                className="group flex items-center gap-3 py-2"
              >
                <span
                  className={cn(
                    "text-xs tabular-nums transition-colors duration-(--duration-micro)",
                    isActive ? "text-brand-yellow" : "text-fg/55 group-hover:text-fg",
                  )}
                >
                  {room.index}
                </span>
                <span className="relative block h-px w-14 overflow-hidden bg-white/20">
                  <motion.span
                    className="absolute inset-0 origin-right bg-brand-yellow shadow-[0_0_10px_var(--color-brand-yellow)]"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: DURATION.ui, ease: BEZIER.out }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
