import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";

/**
 * Validates enquiries server-side with the same zod schema as the form.
 * Hook up delivery here (email provider, CRM, Slack webhook…) — see README.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  // TODO(integration): forward parsed.data to your delivery channel.
  return NextResponse.json({ ok: true });
}
