/**
 * Configuración de sitio dependiente del entorno.
 *
 * Nada de URLs de producción escritas a fuego: el dominio todavía no existe.
 * Hasta que exista, el sitio se sirve con `noindex` para que un despliegue
 * provisional no se indexe y compita después con el dominio real.
 */

/**
 * Convierte un valor de entorno en un origen HTTP(S) normalizado, o `null`.
 *
 * `allowProtocolLess` distingue dos tipos de fuente:
 *  - Las variables de Vercel (`VERCEL_URL`) llegan como host desnudo
 *    (`foo.vercel.app`) y es correcto asumir https.
 *  - Un valor escrito a mano SIN protocolo es casi siempre un error de
 *    configuración; asumir https lo convertiría en un dominio aparente y
 *    ocultaría el fallo. Por eso ahí se rechaza.
 */
export function parseHttpOrigin(
  value: string | undefined,
  { allowProtocolLess = false }: { allowProtocolLess?: boolean } = {}
): string | null {
  // `?? fallback` NO basta: una variable definida como cadena vacía en el
  // panel de Vercel pasa el `??` y revienta `new URL("")` durante el
  // prerender. Hay que tratar "" y "   " como ausencia.
  const candidate = value?.trim();
  if (!candidate) return null;

  const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(candidate);
  if (hasProtocol && !/^https?:\/\//i.test(candidate)) return null; // javascript:, file:, data:…
  if (!hasProtocol && !allowProtocolLess) return null; // ruta relativa o dominio suelto

  try {
    const url = new URL(hasProtocol ? candidate : `https://${candidate}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    return url.origin; // normaliza y elimina la barra final
  } catch {
    return null;
  }
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const fromExplicit = parseHttpOrigin(explicit);
  if (fromExplicit) return fromExplicit;

  // Un valor presente pero inválido es un error de configuración, no una
  // ausencia: se avisa en build en lugar de degradar en silencio a localhost
  // y publicar metadata apuntando a una máquina local.
  if (explicit?.trim() && process.env.NODE_ENV === "production") {
    console.warn(
      `[apc] NEXT_PUBLIC_SITE_URL no es una URL http(s) absoluta válida. ` +
        `Se ignora y se usa el fallback. Valor recibido: ${JSON.stringify(explicit)}`
    );
  }

  // Vercel expone estas sin protocolo; ahí sí es correcto asumir https.
  const production = parseHttpOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL, {
    allowProtocolLess: true,
  });
  if (production) return production;

  const preview = parseHttpOrigin(process.env.VERCEL_URL, { allowProtocolLess: true });
  if (preview) return preview;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/**
 * Solo se permite indexar cuando se activa explícitamente.
 * Poner `NEXT_PUBLIC_INDEXABLE=true` únicamente cuando el dominio definitivo
 * esté apuntando al sitio. Ver el checklist de lanzamiento en README.md.
 */
export const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";

/**
 * Identidad de marca — fuente única de verdad.
 *
 * "Andrade Parra Corporation" es un nombre propio: NO se traduce, en ninguna
 * ruta ni en ningún idioma. Por eso vive aquí y no en los diccionarios de
 * i18n, que existen precisamente para el texto que sí cambia entre idiomas.
 * Colocarlo en `messages/*.json` invitaría a que alguien lo "tradujera".
 *
 * `descriptor` va igualmente fijo en inglés dentro del logotipo. En el cuerpo
 * de las páginas en español sí se puede hablar de "remodelación general" como
 * descripción del servicio, pero eso es copy, no la marca.
 *
 * La marca anterior era "Ampargo", usada por error.
 */
export const BRAND = {
  /** Escritura oficial. Verificado carácter por carácter. */
  name: "Andrade Parra Corporation",
  /** Descriptor del logotipo. Siempre en inglés, siempre exacto. */
  descriptor: "General Remodeling",
  /** Sigla admitida en isotipo, favicon y variante compacta. Nunca sustituye al nombre completo. */
  initials: "AP",
} as const;

export const BUSINESS = {
  name: BRAND.name,
  /**
   * Dirección del formulario de levantamiento. HOY NO SE PUBLICA en ninguna
   * vista: `SERVICE_AREA.hasPublicOffice` está en `false` mientras el cliente
   * no confirme por escrito que hay local de cara al público, y el sitio
   * afirma solo zona de servicio. Se conserva aquí porque hará falta para la
   * ficha de Google Business Profile — punto 06 de
   * docs/MATERIAL_PENDIENTE_CLIENTE.html. Ver content/company.ts.
   */
  streetAddress: "8027 Burning Hills Dr",
  city: "Houston",
  region: "TX",
  postalCode: "77075",
  country: "US",
  /**
   * Teléfonos en E.164. Ambos contactos son igualmente principales;
   * el primero se usa como teléfono de ficha para los datos estructurados.
   */
  phones: ["+18327940720", "+18326524660"],
} as const;

/**
 * Fuente única de los dos contactos de WhatsApp — igualmente principales.
 * Vive fuera de los diccionarios de idioma a propósito: un nombre o un
 * teléfono no se traducen, y tenerlos por duplicado en es-US.json y en-US.json
 * es exactamente el defecto que se encontró en la versión anterior del sitio
 * (ver AUDITORIA_Y_PLAN_AMPARGO.md, hallazgo P2-3): si alguien actualiza un
 * número en un idioma y olvida el otro, el CTA principal queda roto a medias.
 */
export const WHATSAPP_CONTACTS = [
  {
    id: "jose-andrade",
    name: "Jose Andrade",
    phone: "18327940720",
    phoneDisplay: "(832) 794-0720",
    // `null` mientras no exista foto real — mismo criterio de
    // "dato ausente → función ausente" que COMPANY_STORY/MISSION_VISION
    // en content/company.ts. Recibida del cliente el 2026-09-15.
    //
    // Nombre de archivo con sufijo "-v2": el cliente confirmó por fin cuál
    // foto es cuál después de varias vueltas, y la caché del navegador (la
    // suya y la del optimizador de imágenes de Next) se negaba a soltar la
    // versión anterior aunque el archivo en el servidor ya estuviera bien.
    // Un nombre nuevo obliga a pedirlo de cero — no hay caché que pueda
    // tener guardada una URL que nunca existió.
    photo: "/images/equipo/jose-andrade-v2.png",
    // Perfil personal, recibido del cliente el 2026-09-14. Mario no tiene
    // uno todavía — `null`, mismo criterio de "dato ausente → función
    // ausente" que `photo` arriba.
    facebook: "https://www.facebook.com/share/1BvNApBCwy/?mibextid=wwXIfr" as string | null,
  },
  {
    id: "mario-parra",
    name: "Mario Parra",
    phone: "18326524660",
    phoneDisplay: "(832) 652-4660",
    photo: "/images/equipo/mario-parra-v2.png",
    facebook: null as string | null,
  },
] as const;

/**
 * Tarjetas Open Graph, 1200 × 630.
 *
 * Se generan con `npm run build:og` a partir de fotografías reales del
 * portafolio; ver qa/build-og.mjs. Las rutas van RELATIVAS: `metadataBase` en
 * app/[locale]/layout.tsx las resuelve contra `SITE_URL`, de modo que al
 * conectar el dominio definitivo se vuelven absolutas solas. Escribirlas
 * absolutas aquí las dejaría clavadas en el dominio provisional de Hostinger.
 */
export const OG_IMAGE = {
  home: "/og/home.jpg",
  quote: "/og/quote.jpg",
} as const;

/**
 * Correo empresarial.
 *
 * `contacto@ampargo.com`, alojado en Zoho Mail (plan gratuito, hasta 5
 * buzones). Verificado por dominio con registros MX/SPF/DKIM en Cloudflare
 * el 3 de septiembre de 2026.
 */
export const BUSINESS_EMAIL: string | null = "contacto@ampargo.com";

/**
 * Página de Facebook de la empresa. Recibida del cliente el 2026-09-14.
 * Mismo criterio nullable que `BUSINESS_EMAIL`: hoy tiene valor, pero el
 * tipo deja constancia de que el dato puede faltar.
 */
export const BUSINESS_FACEBOOK: string | null = "https://www.facebook.com/share/1EZedSTGww/?mibextid=wwXIfr";
