"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profile, socialLinks } from "@/data/profile";
import { validUrl } from "@/data/site";
import { isEmailJSConfig, sendSignal, type EmailJSConfig } from "@/lib/emailjs";

export default function ContactExhibit({ onSignal }: { onSignal: () => void }) {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [config, setConfig] = useState<EmailJSConfig | null>(null);
  const [connection, setConnection] = useState<"loading" | "ready" | "unavailable">("loading");
  const [sending, setSending] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const inFlight = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function connect() {
      try {
        const response = await fetch("/api/contact/config", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (data && typeof data === "object" && "available" in data && data.available === true && "config" in data && isEmailJSConfig(data.config)) {
          setConfig(data.config);
          setConnection("ready");
        } else setConnection("unavailable");
      } catch {
        if (!controller.signal.aborted) setConnection("unavailable");
      }
    }
    void connect();
    return () => { controller.abort(); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setNotice(profile.email); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !config) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    inFlight.current = true;
    setSending(true);
    setDelivered(false);
    setNotice("");
    try {
      await sendSignal(config, {
        name: String(fields.get("name") ?? ""),
        email: String(fields.get("email") ?? ""),
        message: String(fields.get("message") ?? ""),
      });
      form.reset();
      setDelivered(true);
      onSignal();
      setNotice("Signal sent. Thank you for reaching out!");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your signal could not be sent. Please try again later.");
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  return <div className="exhibit-content contact-content" tabIndex={0} aria-label="Scrollable section content">
    <div className="world-eyebrow"><span />THE SIGNAL ROOM</div>
    <h2>A new connection.<br /><em>A new possibility.</em></h2>
    <div className="world-scroll">
      <p className="world-description">Research internships, AI/ML roles, or an interesting problem. Let’s see what we can build.</p>
      <div className="world-email">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button onClick={copy} aria-label={copied ? "Email copied" : "Copy email address"}>{copied ? <Check size={17} /> : <Copy size={17} />}</button>
      </div>
      <div className="contact-world-socials">{socialLinks.filter(link => link.icon !== "email" && validUrl(link.url)).map(link => <a href={link.url} key={link.label} target="_blank" rel="noopener noreferrer" className="world-text-link">{link.label}<ArrowUpRight size={15} /></a>)}</div>
      <form className="world-form" onSubmit={submit} onInput={()=>setDelivered(false)} aria-busy={sending}>
        <div>
          <label htmlFor="signal-name">Name<Input id="signal-name" name="name" autoComplete="name" required maxLength={100} readOnly={sending} placeholder="Your name" /></label>
          <label htmlFor="signal-email">Email<Input id="signal-email" name="email" type="email" autoComplete="email" required maxLength={254} readOnly={sending} placeholder="you@company.com" /></label>
        </div>
        <label htmlFor="signal-message">Your message<Textarea id="signal-message" name="message" rows={3} required maxLength={3000} readOnly={sending} placeholder="What are you working on?" /></label>
        <div className="signal-send" data-delivered={delivered}>
          <span className="delivery-receipt">{delivered ? <><Check size={14}/>Signal sent</> : connection === "loading" ? "Connecting…" : connection === "ready" ? "Straight to my inbox." : "Please use the email link above if there's an issue."}</span>
          <button className="world-primary" type="submit" disabled={connection !== "ready" || sending} aria-describedby="signal-status">{sending ? "Sending signal…" : delivered ? "Sent" : "Send a signal"}{delivered?<Check size={16}/>:<Mail size={16}/>}</button>
          {delivered&&<i className="delivery-photon" aria-hidden="true"/>}
        </div>
        <p id="signal-status" role="status" aria-live="polite" className="world-notice">{notice || (connection === "unavailable" ? "Let's connect!" : "")}</p>
      </form>
    </div>
  </div>;
}
