"use client";

import { motion } from "motion/react";
import { services, ui } from "@/content/site";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";
import { useSound } from "@/components/providers/SoundProvider";

type Props = { active: number; onSelect: (i: number) => void };

/**
 * Side progress rail 01–04. Keyboard accessible; clicking scrolls to that room.
 * Follows the page theme. On light it floats over the room photo, so a frosted white panel sits behind it
 * (a pseudo-element with negative inset, so the rail itself doesn't move).
 */
export function RoomRail({ active, onSelect }: Props) {
  const { tick } = useSound();

  return (
    <nav
      aria-label={ui.roomRail}
      className="room-rail invisible absolute top-24 right-[var(--gutter)] z-20 before:absolute before:-inset-x-4 before:-inset-y-2 before:-z-10 before:rounded-2xl before:bg-bg/95 before:shadow-(--shadow) before:backdrop-blur-md md:top-1/2 md:-translate-y-1/2 dark:before:hidden"
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
                    isActive
                      ? "text-accent-ink"
                      : "text-muted group-hover:text-fg dark:text-fg/55 dark:group-hover:text-fg",
                  )}
                >
                  {room.index}
                </span>
                <span className="relative block h-0.5 w-14 overflow-hidden bg-ink/15 dark:h-px dark:bg-white/20">
                  <motion.span
                    className="absolute inset-0 origin-right bg-brand-yellow dark:shadow-[0_0_10px_var(--color-brand-yellow)]"
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
