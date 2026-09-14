import type { AppLocale } from "@/i18n/routing";

/**
 * Datos institucionales de Andrade Parra Corporation.
 *
 * Separado de los diccionarios de i18n a propósito: esto no es copy de
 * interfaz, son HECHOS sobre la empresa. Si un hecho no está confirmado por
 * el cliente, su campo vale `null` y la sección que lo consume no se renderiza.
 *
 * El patrón es siempre el mismo: dato ausente → sección ausente. Nunca
 * "Añada aquí la historia de la empresa" en producción.
 */

/* ─── Historia ───────────────────────────────────────────────────────────
 * El formulario de requerimientos (Q37/Q41) solo aportó una frase de
 * intención — "se dedica a cumplir los sueños del cliente" — que no alcanza
 * para una sección "Our Story" creíble. Falta: año de fundación, origen,
 * trayectoria, tipo de obra dominante.
 *
 * NO se redacta una historia plausible: sería ficción sobre una empresa real.
 * Cuando el cliente responda el cuestionario de CONTENT REQUIRED, se rellena
 * aquí y la sección aparece sola.
 */
export interface CompanyStory {
  paragraphs: Record<AppLocale, string[]>;
}

export const COMPANY_STORY: CompanyStory | null = null;

/* ─── Misión y visión ────────────────────────────────────────────────────
 * Mismo patrón que COMPANY_STORY, por el mismo motivo: una misión o visión
 * es una declaración oficial de la empresa, no una frase de ambiente que se
 * pueda redactar por aproximación. Publicar un texto inventado bajo el
 * nombre "Misión" o "Visión" de Andrade Parra Corporation sería atribuirle
 * a la empresa una declaración que nunca hizo — el mismo problema que ya
 * evita COMPANY_STORY, aplicado a dos frases en vez de a un párrafo largo.
 *
 * Pedido explícitamente en la sesión del 2026-09-13 ("colocar misión y
 * visión en el Home"): la sección ya está montada en el Home
 * (components/home/V7MissionVision.tsx) y aparece SOLA en cuanto esto deje
 * de ser `null` — no hace falta tocar el componente ni la página.
 */
export interface MissionVision {
  mission: Record<AppLocale, string>;
  vision: Record<AppLocale, string>;
}

export const MISSION_VISION: MissionVision | null = null;

/* ─── Personas ───────────────────────────────────────────────────────────
 * Se conocen tres nombres por el formulario (Jose Andrade, Ramon Andrade,
 * Mario Parra), pero NO se conocen sus cargos, ni su trayectoria, ni existe
 * autorización para publicar fotos suyas.
 *
 * Publicar un nombre con un cargo inventado es exactamente el tipo de dato
 * falso que el proyecto prohíbe, así que la sección queda vacía hasta que
 * cada persona confirme cómo quiere aparecer.
 */
export interface TeamMember {
  id: string;
  name: string;
  /** Cargo tal como la persona lo confirmó. Nunca deducido. */
  role: Record<AppLocale, string>;
  /** Biografía breve, opcional. */
  bio?: Record<AppLocale, string>;
  /** Archivo en /public/images/equipo/. Requiere consentimiento por escrito. */
  photo?: string;
}

export const TEAM: TeamMember[] = [];

/* ─── Zona de servicio y sede ────────────────────────────────────────────
 * `hasPublicOffice` gobierna si se publica la dirección, si aparece el enlace
 * "cómo llegar" y si el JSON-LD incluye `address`.
 *
 * PENDIENTE DEL CLIENTE (revisar cuando confirme la oficina). Estuvo en `true`
 * a partir de una confirmación verbal del 2026-08-23, y con ello el sitio
 * publicaba 8027 Burning Hills Dr en el pie, en /contacto y en el JSON-LD.
 * Esa confirmación no distingue entre un local que recibe visitas y la
 * dirección administrativa del negocio, y `address` en JSON-LD le dice a
 * Google "aquí se puede venir": si resulta ser un domicilio particular, el
 * sitio estaría dirigiendo desconocidos a la casa de alguien y el error sería
 * difícil de retirar del panel de conocimiento.
 *
 * Hasta que el cliente confirme por escrito que hay local de cara al público,
 * el sitio afirma solo ZONA DE SERVICIO — "Houston y alrededores", que sí es
 * un dato verdadero — y omite la dirección en los tres sitios a la vez.
 *
 * Es el punto 06 del checklist de docs/MATERIAL_PENDIENTE_CLIENTE.html, que
 * necesita esa misma dirección para la ficha de Google Business Profile. Al
 * confirmarse, se pone `true` aquí y la dirección vuelve sola a los tres
 * sitios: una dirección verificable es uno de los factores más fuertes del
 * SEO local.
 */
export const SERVICE_AREA = {
  city: "Houston",
  region: "TX",
  country: "US",
  /**
   * Municipios que la empresa cubre de verdad, para la sección de cobertura.
   *
   * VACÍO A PROPÓSITO. Es tentador rellenarlo con los suburbios obvios del
   * área metropolitana (Katy, Sugar Land, Pearland…), pero eso sería inventar:
   * afirmar cobertura en un municipio al que quizá no se desplazan genera
   * solicitudes que hay que rechazar, y es justo la clase de promesa que
   * destruye la confianza que la sección busca construir.
   *
   * Mientras esté vacío, la sección afirma solo "Houston y alrededores" e
   * invita a preguntar. Al añadir municipios, la lista aparece sola.
   */
  nearbyAreas: [] as string[],
  /** Sin confirmación por escrito de local de cara al público. Ver arriba. */
  hasPublicOffice: false,
} as const;

/* ─── Señales de confianza ───────────────────────────────────────────────
 * Solo afirmaciones verificables hoy. Cada una está respaldada por un hecho
 * comprobable del negocio o del propio sitio:
 *
 *   serviceArea       → confirmado en el formulario, Q4.
 *   residentialCommercial → confirmado en Q15 (incluye obra comercial).
 *   freeEstimates     → cierto: el formulario de cotización no tiene costo.
 *   bilingual         → cierto y comprobable: el sitio existe en ES y EN.
 *
 * NO se incluyen: años de experiencia, número de obras, licencias, seguros,
 * premios ni garantías. Ninguno está confirmado por escrito.
 */
export const TRUST_SIGNALS = [
  "serviceArea",
  "residentialCommercial",
  "freeEstimates",
  "bilingual",
] as const;

export type TrustSignal = (typeof TRUST_SIGNALS)[number];
