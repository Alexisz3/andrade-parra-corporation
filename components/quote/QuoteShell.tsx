"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { pickContactIndex, quoteSeed } from "@/lib/assignment";
import { compressImage } from "@/lib/compress-image";
import DeliveryChannelSelector, { type Channel } from "./DeliveryChannelSelector";

export interface ServiceOption { id: string; label: string; }
export interface QuoteDraft {
  service: string; location: string; description: string;
  name: string; phone: string; email: string;
  channel: Channel | null; consent: boolean;
}
export interface WhatsAppTarget { phone: string; name: string; phoneDisplay?: string; }

const DRAFT_KEY = "apc-quote-draft";
const LEGACY_DRAFT_KEY = "ampargo-quote-draft";
const EMPTY_DRAFT: QuoteDraft = {
  service: "", location: "", description: "", name: "", phone: "", email: "",
  channel: "whatsapp", consent: false,
};
type ErrorMap = Partial<Record<keyof QuoteDraft, string>>;
type SubmitState = "idle" | "sending" | "sent" | "error";

/* Mismo criterio que app/api/quote/route.ts: el cliente valida para dar
   feedback inmediato, pero el servidor es quien manda — revalida todo. */
const MAX_PHOTOS = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  // Algunos navegadores móviles no informan el tipo MIME de un HEIC/HEIF:
  // se acepta por extensión y que el servidor tenga la última palabra.
  if (file.type) return false;
  return /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} role="alert" className="v7-field-error">{message}</p> : null;
}

/** Formulario V7 de una sola vista, fiel al flujo breve de la referencia. */
export default function QuoteShell({
  services, initialServiceId, whatsappTargets, businessEmail, emailAvailable,
}: {
  services: ServiceOption[];
  initialServiceId?: string;
  whatsappTargets: WhatsAppTarget[];
  businessEmail: string | null;
  emailAvailable: boolean;
}) {
  const t = useTranslations("Quote");
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const restored = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let saved: Partial<QuoteDraft> = {};
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY) ?? sessionStorage.getItem(LEGACY_DRAFT_KEY);
      if (raw) saved = JSON.parse(raw) as Partial<QuoteDraft>;
      sessionStorage.removeItem(LEGACY_DRAFT_KEY);
    } catch { /* El formulario funciona sin almacenamiento. */ }
    const initial = initialServiceId && services.some((service) => service.id === initialServiceId)
      ? initialServiceId : "";
    // Un borrador guardado con canal "email" cuando ese canal ya no está
    // disponible (o nunca lo estuvo en este dispositivo) cae a WhatsApp en
    // vez de dejar un radio deshabilitado marcado como seleccionado.
    const savedChannel = saved.channel === "email" && !emailAvailable ? "whatsapp" : saved.channel;
    setDraft((current) => ({
      ...current, ...saved,
      channel: savedChannel ?? current.channel,
      service: saved.service || initial || current.service,
    }));
    track("quote_started", { service: initial || "none" });
  }, [initialServiceId, services, emailAvailable]);

  useEffect(() => {
    if (!restored.current) return;
    try {
      // Los archivos no se serializan: solo el resto del borrador persiste.
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch { /* ayuda opcional */ }
  }, [draft]);

  const update = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      if (key === "phone" || key === "email") { delete next.phone; delete next.email; }
      return next;
    });
    if (key === "channel" && submitState !== "idle") setSubmitState("idle");
  };

  const validate = (): ErrorMap => {
    const next: ErrorMap = {};
    if (draft.description.trim().length < 4) next.description = t("errDescription");
    if (!draft.name.trim()) next.name = t("errName");
    const phone = draft.phone.replace(/\D/g, "");
    const email = draft.email.trim();
    if (!phone && !email) next.phone = t("errContact");
    if (phone && phone.length < 10) next.phone = t("errPhone");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) next.email = t("errEmail");
    if (!draft.consent) next.consent = t("errConsent");
    return next;
  };

  const buildMessage = () => {
    const service = services.find((item) => item.id === draft.service)?.label;
    const lines = [t("msgIntro"), ""];
    const add = (label: string, value?: string) => value?.trim() && lines.push(`${label}: ${value.trim()}`);
    add(t("msgService"), service); add(t("msgLocation"), draft.location); add(t("msgDescription"), draft.description);
    lines.push(""); add(t("msgName"), draft.name); add(t("msgPhone"), draft.phone); add(t("msgEmail"), draft.email);
    return lines.join("\n");
  };

  const handleAddPhotos = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setPhotosError(null);
    const incoming = Array.from(fileList);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { setPhotosError(t("errPhotosCount")); return; }
    if (incoming.length > remaining) setPhotosError(t("errPhotosCount"));

    const processed: File[] = [];
    for (const file of incoming.slice(0, remaining)) {
      if (!isAllowedImage(file)) { setPhotosError(t("errPhotosType")); continue; }
      const compressed = await compressImage(file);
      if (compressed.size > MAX_FILE_BYTES) { setPhotosError(t("errPhotosSize")); continue; }
      processed.push(compressed);
    }

    setPhotos((current) => {
      const next = [...current, ...processed];
      const total = next.reduce((sum, file) => sum + file.size, 0);
      if (total > MAX_TOTAL_BYTES) {
        setPhotosError(t("errPhotosTotalSize"));
        return current;
      }
      return next;
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, i) => i !== index));
    setPhotosError(null);
  };

  const submitByEmail = async () => {
    setSubmitState("sending");
    try {
      const formData = new FormData();
      const serviceLabel = services.find((item) => item.id === draft.service)?.label ?? draft.service;
      formData.set("name", draft.name);
      formData.set("phone", draft.phone);
      formData.set("email", draft.email);
      formData.set("service", serviceLabel);
      formData.set("location", draft.location);
      formData.set("description", draft.description);
      formData.set("consent", String(draft.consent));
      photos.forEach((photo) => formData.append("photos", photo));

      const response = await fetch("/api/quote", { method: "POST", body: formData });
      const data: { ok: boolean } = await response.json().catch(() => ({ ok: false }));
      if (!response.ok || !data.ok) throw new Error("send_failed");

      setSubmitState("sent");
      track("quote_submitted", { channel: "email", service: draft.service || "none" });
    } catch {
      setSubmitState("error");
    }
  };

  const submitByWhatsapp = () => {
    const seed = quoteSeed([draft.name, draft.phone.replace(/\D/g, ""), draft.description]);
    const target = whatsappTargets[pickContactIndex(seed, whatsappTargets.length)];
    if (!target) return;
    const url = buildWhatsAppLink(target.phone, buildMessage());
    if (!url) return;
    setHandoffUrl(url);
    track("quote_submitted", { channel: "whatsapp", service: draft.service || "none" });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) { document.getElementById(first)?.focus(); return; }

    if (draft.channel === "email") void submitByEmail();
    else submitByWhatsapp();
  };

  const fieldClass = (key: keyof QuoteDraft) => `v7-field-control ${errors[key] ? "is-error" : ""}`;
  const isEmailChannel = draft.channel === "email";
  const sending = submitState === "sending";

  return (
    <section className="v7-quote-section">
      <div className="v7-container v7-quote-grid">
        <form className="v7-quote-form" onSubmit={submit} noValidate>
          <div className="v7-quote-form-head"><span className="v7-meta">{t("formMeta")}</span><p>{t("formHint")}</p></div>

          <div className="mb-6">
            <DeliveryChannelSelector value={draft.channel} onChange={(c) => update("channel", c)} emailAvailable={emailAvailable} />
          </div>

          <div className="v7-form-grid">
            <div className="v7-field"><label htmlFor="name">{t("nameLabel")}</label><input id="name" autoComplete="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={fieldClass("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} placeholder={t("namePlaceholder")} /><FieldError id="name-error" message={errors.name} /></div>
            <div className="v7-field"><label htmlFor="phone">{t("phoneLabel")}</label><input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={(e) => update("phone", e.target.value)} className={fieldClass("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} placeholder="(832) 000-0000" /><FieldError id="phone-error" message={errors.phone} /></div>
            <div className="v7-field"><label htmlFor="email">{t("emailLabel")}</label><input id="email" type="email" inputMode="email" autoComplete="email" value={draft.email} onChange={(e) => update("email", e.target.value)} className={fieldClass("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} placeholder={t("emailPlaceholder")} /><FieldError id="email-error" message={errors.email} /></div>
            <div className="v7-field"><label htmlFor="service">{t("serviceLabel")}</label><select id="service" value={draft.service} onChange={(e) => update("service", e.target.value)} className={fieldClass("service")}><option value="">{t("servicePlaceholder")}</option>{services.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}</select></div>
            <div className="v7-field v7-field-full"><label htmlFor="location">{t("locationLabel")}</label><input id="location" autoComplete="postal-code" value={draft.location} onChange={(e) => update("location", e.target.value)} className={fieldClass("location")} placeholder={t("locationPlaceholder")} /></div>
            <div className="v7-field v7-field-full"><label htmlFor="description">{t("descriptionLabel")}</label><textarea id="description" rows={5} maxLength={2000} value={draft.description} onChange={(e) => update("description", e.target.value)} className={fieldClass("description")} aria-invalid={!!errors.description} aria-describedby={errors.description ? "description-error" : undefined} placeholder={t("descriptionPlaceholder")} /><FieldError id="description-error" message={errors.description} /></div>

            {isEmailChannel ? (
              <div className="v7-field v7-field-full">
                <label htmlFor="photos">{t("photosLabel")}</label>
                <p className="mb-2 text-sm text-muted">{t("photosHint")}</p>
                <input
                  ref={fileInputRef}
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => { void handleAddPhotos(e.target.files); e.target.value = ""; }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photos.length >= MAX_PHOTOS}
                    className="border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("photosAdd")}
                  </button>
                  {photos.length > 0 ? <span className="text-sm text-muted">{t("photosCount", { count: photos.length })}</span> : null}
                </div>
                {photos.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <li key={`${photo.name}-${index}`} className="flex items-center gap-2 border border-line px-3 py-2 text-sm text-ink">
                        <span className="max-w-[9rem] truncate">{photo.name}</span>
                        <button type="button" onClick={() => removePhoto(index)} className="text-muted hover:text-ink" aria-label={`${t("photosRemove")}: ${photo.name}`}>
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <FieldError id="photos-error" message={photosError ?? undefined} />
              </div>
            ) : null}

            <div className="v7-field v7-field-full"><label className="v7-consent"><input id="consent" type="checkbox" checked={draft.consent} onChange={(e) => update("consent", e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined} /><span>{t("consent")}</span></label><FieldError id="consent-error" message={errors.consent} /></div>
          </div>

          <div className="v7-quote-actions">
            <p>{isEmailChannel ? t("continueNoteEmail") : t("continueNote")}</p>
            <button type="submit" disabled={sending}>
              <span>{sending ? t("sending") : isEmailChannel ? t("sendEmail") : t("sendWhatsapp")}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {!isEmailChannel && handoffUrl ? (
            <div className="v7-handoff" role="status">
              <strong>{t("handoffHeadingWhatsapp")}</strong>
              <p>{t("handoffBodyWhatsapp")} {t("handoffPhotos")}</p>
              <a href={handoffUrl} target="_blank" rel="noopener noreferrer">{t("handoffReopenWhatsapp")} ↗</a>
            </div>
          ) : null}

          {isEmailChannel && submitState === "sent" ? (
            <div className="v7-handoff" role="status">
              <strong>{t("emailSentHeading")}</strong>
              <p>{t("emailSentBody")}</p>
            </div>
          ) : null}

          {isEmailChannel && submitState === "error" ? (
            <div className="v7-handoff" role="alert">
              <strong>{t("emailErrorHeading")}</strong>
              <p>{t("emailErrorBody")}</p>
              <button
                type="button"
                onClick={() => { setSubmitState("idle"); update("channel", "whatsapp"); }}
                className="border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                {t("emailErrorRetryWhatsapp")}
              </button>
            </div>
          ) : null}
        </form>

        <aside className="v7-quote-card">
          <div>
            <div className="v7-quote-card-top"><span className="v7-meta">{t("directMeta")}</span><b>ES / EN</b></div>
            <h2>{t("directTitle")}</h2><p>{t("directBody")}</p>
            <div className="v7-quote-contact-lines">
              {whatsappTargets.map((contact) => <a key={contact.phone} href={`tel:+${contact.phone}`}><span><small>{contact.name}</small><strong>{contact.phoneDisplay ?? contact.phone.replace(/^1?(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3")}</strong></span><i aria-hidden="true">↗</i></a>)}
              {businessEmail ? <a href={`mailto:${businessEmail}`}><span><small>Email</small><strong>{businessEmail}</strong></span><i aria-hidden="true">↗</i></a> : null}
              {whatsappTargets[0] ? <a href={`https://wa.me/${whatsappTargets[0].phone}`} target="_blank" rel="noopener noreferrer" className="is-whatsapp"><span><small>WhatsApp</small><strong>{t("channelWhatsapp")}</strong></span><i aria-hidden="true">↗</i></a> : null}
            </div>
          </div>
          <div className="v7-quote-area"><strong>HOUSTON, TX</strong><span>{t("areaNote")}</span></div>
        </aside>
      </div>
    </section>
  );
}
