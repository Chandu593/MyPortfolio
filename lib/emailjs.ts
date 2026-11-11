export type EmailJSConfig = { serviceId: string; templateId: string; publicKey: string };
export type SignalMessage = { name: string; email: string; message: string };

export function isEmailJSConfig(value: unknown): value is EmailJSConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Record<string, unknown>;
  return ["serviceId", "templateId", "publicKey"].every(key =>
    typeof config[key] === "string" && /^[A-Za-z0-9_-]+$/.test(config[key] as string)
  );
}

/** Browser-side delivery: only the EmailJS public key is used. Never retry automatically. */
export async function sendSignal(config: EmailJSConfig, message: SignalMessage): Promise<void> {
  if (!isEmailJSConfig(config)) throw new Error("Direct messaging is unavailable. Please use the email link above.");
  const name = message.name.trim(), email = message.email.trim(), text = message.message.trim();
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !text || text.length > 3000) {
    throw new Error("Please enter your name, a valid email address, and a message.");
  }
  let response: Response;
  try {
    response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: {
          name, email, message: text,
          from_name: name, from_email: email, reply_to: email,
          subject: `Portfolio enquiry from ${name}`,
        },
      }),
    });
  } catch {
    throw new Error("Delivery could not be confirmed. Your message is still here; check your connection before trying again.");
  }
  if (response.status === 429) throw new Error("Sending is temporarily limited. Please wait a moment before trying again.");
  if (!response.ok) throw new Error("Your signal could not be sent. Your message is still here; try again later or use the email link above.");
}
