import { NextResponse } from "next/server";
import { EMAIL_ENABLED, sendQuoteEmail } from "@/lib/mail";

/**
 * Recibe el formulario de cotización cuando el visitante elige el canal de
 * correo (`DeliveryChannelSelector`, canal "email") y lo reenvía con las
 * fotos adjuntas de verdad — algo que un enlace `mailto:` no puede hacer.
 *
 * Todo se revalida aquí aunque `QuoteShell.tsx` ya valide del lado del
 * cliente: el cliente es una sugerencia, nunca la fuente de verdad.
 */

const MAX_FILES = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB — ya vienen comprimidas desde el navegador.
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // Cómodo bajo el límite de adjuntos de Resend.
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  if (!EMAIL_ENABLED) {
    // No debería llegar aquí: `emailAvailable=false` oculta el canal en la
    // interfaz. Si llega (JS desactualizado, petición directa), respuesta
    // honesta, no un 500 genérico.
    return NextResponse.json(
      { ok: false, error: "email_disabled" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const service = String(form.get("service") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const consent = String(form.get("consent") ?? "") === "true";

  if (!name || description.length < 4 || (!phone && !email) || !consent) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: "too_many_files" }, { status: 400 });
  }
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: "total_too_large" }, { status: 400 });
  }
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ ok: false, error: "file_type" }, { status: 400 });
    }
  }

  const attachments = await Promise.all(
    files.map(async (file, index) => ({
      filename: file.name || `foto-${index + 1}.jpg`,
      content: Buffer.from(await file.arrayBuffer()),
    }))
  );

  try {
    await sendQuoteEmail({ name, phone, email, service, location, description, attachments });
  } catch (error) {
    console.error("quote email failed", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
