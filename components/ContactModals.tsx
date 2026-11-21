"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { BUSINESS_EMAIL, INSTAGRAM_HANDLE, TEAM } from "@/lib/constants";

type Channel = "choice" | "whatsapp" | "instagram" | "email";
type ContactTarget = { channel: Channel; member?: (typeof TEAM)[number] } | null;
const services = ["Social Media", "Branding", "Ads", "SEO", "Content", "Strategy", "Promotion Shoots", "General enquiry"];

function formattedMessage(name: string, phone: string, service: string, note: string, target: string) {
  return `Hello ${target},\n\nI'm ${name} (${phone}).\nI'm reaching out about: ${service}.${note.trim() ? `\n\nDetails: ${note.trim()}` : ""}\n\nI'd love to discuss how Redline Marketing can help.`;
}

export default function ContactModals() {
  const [target, setTarget] = useState<ContactTarget>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3800);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/\D/g, "");
    const service = String(form.get("service") || "").trim();
    const note = String(form.get("note") || "").trim();
    if (!name || phone.length < 10 || phone.length > 15 || !service) {
      setError("Enter your name, a valid phone number, and choose a service.");
      return;
    }

    const recipient = target.channel === "instagram"
      ? `@${INSTAGRAM_HANDLE}`
      : target.channel === "email"
        ? BUSINESS_EMAIL
        : target.member?.name || "Redline Marketing";
    const message = formattedMessage(name, `+${phone}`, service, note, recipient);

    if (target.channel === "whatsapp") {
      const member = target.member;
      if (!member) return;
      if (!/^[6-9]\d{9}$/.test(member.digits)) {
        setError(`${member.name}'s listed number is ${member.digits.length} digits, not a valid 10-digit Indian mobile number. Please contact Redline by email or Instagram until the number is corrected.`);
        return;
      }
      const digits = member.digits.startsWith("91") ? member.digits : `91${member.digits}`;
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setTarget(null);
    } else if (target.channel === "instagram") {
      setBusy(true);
      const instagramUrl = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
      const instagramWindow = window.open("about:blank", "_blank");
      try {
        await navigator.clipboard.writeText(message);
        showToast("Inquiry copied! Paste it in Instagram DM");
      } catch {
        showToast("Clipboard unavailable. You can still send a message on Instagram.");
      }
      if (instagramWindow) {
        instagramWindow.opener = null;
        instagramWindow.location.href = instagramUrl;
      }
      else window.location.assign(`https://www.instagram.com/${INSTAGRAM_HANDLE}/`);
      setTarget(null);
      setBusy(false);
    } else {
      const subject = encodeURIComponent(`Redline Marketing enquiry — ${service}`);
      const body = encodeURIComponent(message);
      window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
      setTarget(null);
    }
  }

  function openForm(channel: Channel, member?: (typeof TEAM)[number]) {
    setError("");
    setTarget({ channel, member });
  }

  return (
    <>
      <div className="grid gap-3">
        {TEAM.map((member) => (
          <div key={member.name} className="contact-line flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-bold">{member.name}</p>
              <button className="mt-1 text-left text-xs text-[#8d8d8d] hover:text-white" onClick={() => setTarget({ channel: "choice", member })}>{member.phone} ↗</button>
            </div>
            <div className="flex gap-2">
              <button className="button-quiet !min-h-9 !px-3 !text-[9px]" onClick={() => setTarget({ channel: "choice", member })}>Choose action</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-2 sm:grid-cols-3">
        <button className="button-primary !px-3 !text-[9px]" onClick={() => openForm("instagram")}>Message on Instagram</button>
        <button className="button-quiet !px-3 !text-[9px]" onClick={() => openForm("email")}>Email enquiry</button>
        <a className="button-quiet !px-3 !text-[9px]" href={`mailto:${BUSINESS_EMAIL}`}>Open email</a>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#999]">
        <a className="hover:text-white" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${BUSINESS_EMAIL}`} target="_blank" rel="noreferrer">Open in Gmail Web ↗</a>
        <a className="hover:text-white" href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noreferrer">@{INSTAGRAM_HANDLE} ↗</a>
      </div>

      <AnimatePresence>
        {target && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setTarget(null); }}>
            <motion.div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{target.channel === "choice" ? "Choose how to connect" : target.channel === "whatsapp" ? "WhatsApp inquiry" : target.channel === "instagram" ? "Instagram DM" : "Email inquiry"}</p>
                  <h3 id="contact-modal-title" className="mt-2 text-2xl font-black">{target.channel === "choice" ? `Contact ${target.member?.name}` : target.channel === "whatsapp" ? `Message ${target.member?.name}` : target.channel === "instagram" ? "Let's start a conversation" : "Tell us what you need"}</h3>
                </div>
                <button aria-label="Close" className="text-2xl text-[#888]" onClick={() => setTarget(null)}>×</button>
              </div>
              {target.channel === "choice" && (
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <a className="button-quiet" href={`tel:${target.member?.phone.replace(/\s/g, "") || ""}`}>Call directly</a>
                  <button className="button-primary" onClick={() => openForm("whatsapp", target.member)}>WhatsApp message</button>
                </div>
              )}
              {target.channel === "whatsapp" && (
                <div className="mt-4 flex gap-2">
                  <a className="button-quiet !min-h-10 !text-[10px]" href={`tel:${target.member?.phone.replace(/\s/g, "") || ""}`}>Call directly</a>
                  <span className="self-center text-xs text-[#777]">or send an inquiry below</span>
                </div>
              )}
              {target.channel !== "choice" && (
                <form onSubmit={submit}>
                  <div className="field"><label htmlFor="contact-name">Your name *</label><input id="contact-name" name="name" autoComplete="name" maxLength={100} required /></div>
                  <div className="field"><label htmlFor="contact-phone">Your phone number *</label><input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={18} placeholder="+91 98765 43210" required /></div>
                  <div className="field"><label htmlFor="contact-service">Service / reason *</label><select id="contact-service" name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map((service) => <option key={service}>{service}</option>)}</select></div>
                  <div className="field"><label htmlFor="contact-note">Custom message (optional)</label><textarea id="contact-note" name="note" maxLength={1200} placeholder="A little about your project or goals..." /></div>
                  {error && <p role="alert" className="mt-4 text-xs leading-5 text-red-400">{error}</p>}
                  <button disabled={busy} className="button-primary mt-5 w-full">{busy ? "Preparing..." : target.channel === "instagram" ? "Copy inquiry & open Instagram" : target.channel === "whatsapp" ? "Continue to WhatsApp" : "Create email inquiry"}</button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {toast && <div role="status" className="toast">{toast}</div>}
    </>
  );
}
