import { z } from "zod";
import { contact } from "@/content/site";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  eventType: z.enum(contact.eventTypes as unknown as [string, ...string[]], {
    message: "Please choose an event type.",
  }),
  date: z
    .string()
    .min(1, "Please choose a date.")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !Number.isNaN(d.getTime()) && d >= today;
    }, "Please choose a date in the future."),
  guests: z
    .string()
    .trim()
    .regex(/^\d+$/, "Please enter a number of guests.")
    .refine((v) => Number(v) >= 1 && Number(v) <= 100000, "Guests must be between 1 and 100,000."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(2000, "Please keep it under 2,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
