"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";

/** Glassy fields on dark · white fields with grey borders on light. Focus: yellow ring + gold border and label. */
const control =
  "peer block w-full rounded-2xl border bg-(--input-bg) px-5 pt-6 pb-2.5 text-fg outline-none transition-[border-color,background-color,box-shadow] duration-(--duration-micro) ease-out placeholder:text-transparent focus:bg-(--input-bg-focus) focus:shadow-(--input-ring)";

const labelBase =
  "pointer-events-none absolute left-5 origin-left text-muted transition-all duration-(--duration-micro) ease-out";

/** Label floats when focused or filled. */
const floating =
  "top-4 text-base peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:tracking-wide peer-focus:text-accent-ink peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:tracking-wide";

const pinned = "top-2 text-[0.7rem] tracking-wide peer-focus:text-accent-ink";

type Common = { label: string; error?: string; name: string };

function ErrorText({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          id={id}
          role="alert"
          className="mt-2 pl-1 text-sm text-error"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DURATION.micro, ease: BEZIER.out }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const border = (error?: string) =>
  error
    ? "border-error/80"
    : "border-(--input-border) hover:border-(--input-border-hover) focus:border-(--input-border-focus)";

export const TextField = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, error, name, className, type = "text", ...rest }, ref) {
    const id = `field-${name}`;
    const alwaysPinned = type === "date";
    return (
      <div className={cn("relative", className)}>
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(control, border(error), "dark:[color-scheme:dark]")}
          {...rest}
        />
        <label htmlFor={id} className={cn(labelBase, alwaysPinned ? pinned : floating)}>
          {label}
        </label>
        <ErrorText id={`${id}-error`} error={error} />
      </div>
    );
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, error, name, className, ...rest }, ref) {
    const id = `field-${name}`;
    return (
      <div className={cn("relative", className)}>
        <textarea
          ref={ref}
          id={id}
          name={name}
          rows={5}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(control, border(error), "resize-none pt-8")}
          {...rest}
        />
        <label htmlFor={id} className={cn(labelBase, floating)}>
          {label}
        </label>
        <ErrorText id={`${id}-error`} error={error} />
      </div>
    );
  },
);

export const SelectField = forwardRef<
  HTMLSelectElement,
  Common & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }
>(function SelectField({ label, error, name, options, className, ...rest }, ref) {
  const id = `field-${name}`;
  return (
    <div className={cn("relative", className)}>
      <select
        ref={ref}
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(control, border(error), "appearance-none pr-12 [&>option]:bg-surface")}
        defaultValue=""
        {...rest}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <label htmlFor={id} className={cn(labelBase, pinned)}>
        {label}
      </label>
      <span aria-hidden className="pointer-events-none absolute top-5 right-5 text-muted">
        ▾
      </span>
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
});
