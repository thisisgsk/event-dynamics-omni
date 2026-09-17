"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { contact } from "@/content/site";
import { scene } from "@/lib/animation/sceneState";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SelectField, TextAreaField, TextField } from "./FormField";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), mode: "onTouched" });

  const onSubmit = async (data: ContactInput) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      scene.confettiAt = performance.now();
      window.dispatchEvent(new Event("ed:invalidate"));
      reset();
    } catch {
      setStatus("error");
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const f = contact.fields;

  return (
    <GlassCard className="p-6 md:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            role="status"
            className="flex min-h-[28rem] flex-col items-start justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: DURATION.ui, ease: BEZIER.out }}
          >
            <span
              aria-hidden
              className="mb-8 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white bg-accent"
            >
              ✓
            </span>
            <h3 className="font-display text-3xl font-bold md:text-4xl">{contact.success.title}</h3>
            <p className="mt-4 max-w-md text-muted">{contact.success.body}</p>
            <div className="mt-10">
              <MagneticButton variant="ghost" onClick={() => setStatus("idle")} cursorLabel="Again">
                {contact.success.again}
              </MagneticButton>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5 md:grid-cols-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: DURATION.ui, ease: BEZIER.out }}
          >
            <TextField label={f.name} autoComplete="name" error={errors.name?.message} {...register("name")} />
            <TextField
              label={f.email}
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <SelectField
              label={f.eventType}
              options={contact.eventTypes}
              error={errors.eventType?.message}
              {...register("eventType")}
            />
            <TextField label={f.date} type="date" min={today} error={errors.date?.message} {...register("date")} />
            <TextField
              label={f.guests}
              inputMode="numeric"
              className="md:col-span-2"
              error={errors.guests?.message}
              {...register("guests")}
            />
            <TextAreaField
              label={f.message}
              className="md:col-span-2"
              error={errors.message?.message}
              {...register("message")}
            />

            <div className="flex flex-col items-start gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-dim" aria-live="polite">
                {status === "error" ? "Something went wrong — please try again." : ""}
              </p>
              <MagneticButton type="submit" variant="glow" disabled={isSubmitting} cursorLabel="Send">
                {isSubmitting ? contact.sending : contact.submit}
                <span aria-hidden>→</span>
              </MagneticButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
