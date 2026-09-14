import { Resend } from "resend";

/**
 * Correo transaccional para el formulario de cotización.
 *
 * Mismo patrón que `content/company.ts` (COMPANY_STORY, MISSION_VISION):
 * dato ausente → función ausente. Sin `RESEND_API_KEY` el canal de correo
 * queda deshabilitado de forma honesta — así lo anticipaba ya el comentario
 * en `.env.example` ("'none' = canal deshabilitado de forma honesta") antes
 * de que existiera esta ruta.
 *
 * Se usa el remitente de pruebas de Resend (`onboarding@resend.dev`) porque
 * ENVIAR no requiere verificar un dominio propio — solo hace falta la clave
 * de API. Verificar un dominio (`ampargo.com` o el que corresponda) es una
 * mejora aparte: cambia de qué dirección parece venir el correo y ayuda a
 * que no caiga en spam, pero no es necesaria para que esto funcione hoy.
 * Cuando ese dominio esté verificado en Resend, basta con cambiar
 * `FROM_ADDRESS` más abajo.
 */

export const EMAIL_ENABLED = !!process.env.RESEND_API_KEY;

/** A dónde llegan las solicitudes. `QUOTE_INBOX_EMAIL` puede sobrescribirlo
 *  sin tocar código si el cliente cambia de buzón. */
export const QUOTE_INBOX_EMAIL = process.env.QUOTE_INBOX_EMAIL || "contacto@ampargo.com";

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "Andrade Parra Corporation <onboarding@resend.dev>";

let client: Resend | null = null;
function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export interface QuoteEmailAttachment {
  filename: string;
  content: Buffer;
}

export interface QuoteEmailInput {
  name: string;
  phone: string;
  email: string;
  service: string;
  location: string;
  description: string;
  attachments: QuoteEmailAttachment[];
}

/**
 * Envía la solicitud de cotización por correo. Lanza si `EMAIL_ENABLED` es
 * falso — quien llama debe comprobarlo antes (la ruta API lo hace) en vez
 * de descubrirlo aquí a medio envío.
 */
export async function sendQuoteEmail(input: QuoteEmailInput) {
  if (!EMAIL_ENABLED) {
    throw new Error("EMAIL_ENABLED es falso: falta RESEND_API_KEY.");
  }

  const lines = [
    `Nombre: ${input.name}`,
    input.phone ? `Teléfono: ${input.phone}` : null,
    input.email ? `Correo: ${input.email}` : null,
    input.service ? `Servicio: ${input.service}` : null,
    input.location ? `Ubicación: ${input.location}` : null,
    "",
    "Descripción del proyecto:",
    input.description,
  ].filter((line): line is string => line !== null);

  // El SDK de Resend NO lanza en errores de la API (clave inválida, cuota
  // agotada, etc.) — los devuelve como `{ data: null, error }`. Si no se
  // revisa `error` aquí, un fallo real de envío se reporta como éxito.
  const { error } = await getClient().emails.send({
    from: FROM_ADDRESS,
    to: QUOTE_INBOX_EMAIL,
    // Responder al correo llega directo al cliente que pidió la cotización,
    // sin tener que copiar su dirección a mano desde el cuerpo del mensaje.
    replyTo: input.email || undefined,
    subject: `Nueva solicitud de cotización — ${input.name}`,
    text: lines.join("\n"),
    attachments: input.attachments.map((a) => ({ filename: a.filename, content: a.content })),
  });

  if (error) throw new Error(`Resend: ${error.name} — ${error.message}`);
}
