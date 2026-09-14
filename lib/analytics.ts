/**
 * Arquitectura de analítica para Google Analytics 4.
 *
 * NO contiene ningún identificador: el ID real llega por
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Mientras la variable no exista, `GA_ID` es
 * `null`, el script no se inyecta y `track()` no hace nada. Así el sitio
 * funciona idéntico con y sin analítica, y no se envía tráfico de desarrollo
 * a una propiedad ajena por haber dejado un ID de ejemplo escrito en el código.
 *
 * Los nombres de evento están tipados a propósito: un `track("whatsapp_click")`
 * mal escrito no falla en tiempo de ejecución, simplemente no aparece nunca en
 * los informes, y ese es el error más caro de detectar en analítica.
 */

const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/**
 * Un ID de GA4 tiene la forma `G-XXXXXXXXXX`. Validarlo evita que una cadena
 * vacía o un valor de ejemplo inyecte un script roto en todas las páginas.
 */
export const GA_ID = RAW_GA_ID && /^G-[A-Z0-9]{4,}$/i.test(RAW_GA_ID) ? RAW_GA_ID : null;

export const ANALYTICS_ENABLED = GA_ID !== null;

/** Eventos del embudo de captación. Cerrado: no se admiten cadenas libres. */
export type AnalyticsEvent =
  | "quote_started"
  | "quote_step_completed"
  | "quote_submitted"
  | "whatsapp_clicked"
  | "phone_clicked"
  | "email_clicked"
  | "facebook_clicked"
  | "project_viewed"
  | "service_viewed";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event" | "config" | "js", ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Registra un evento. Silencioso y seguro si la analítica está desactivada,
 * si se llama durante el render en servidor, o si el script aún no cargó.
 */
export function track(event: AnalyticsEvent, params: EventParams = {}): void {
  if (!ANALYTICS_ENABLED) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  // Nunca se envían datos personales: ni nombre, ni teléfono, ni correo del
  // visitante. Solo qué ocurrió y en qué contexto.
  window.gtag("event", event, params);
}
