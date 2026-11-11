import { isEmailJSConfig } from "@/lib/emailjs";

export const dynamic = "force-dynamic";

export function GET() {
  // Read at request time so Sites runtime settings work without client-side build secrets.
  // These are public browser identifiers. Do not expose an EmailJS private key here.
  const config = {
    serviceId: (process.env.EMAILJS_SERVICE_ID ?? process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "").trim(),
    templateId: (process.env.EMAILJS_TEMPLATE_ID ?? process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "").trim(),
    publicKey: (process.env.EMAILJS_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "").trim(),
  };
  return Response.json(isEmailJSConfig(config) ? { available: true, config } : { available: false }, {
    headers: { "Cache-Control": "no-store" },
  });
}
