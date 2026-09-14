/**
 * Política de seguridad de contenido — fuente única.
 *
 * Vive en un módulo aparte porque hace falta en DOS sitios que no pueden
 * compartir código TypeScript directamente: `next.config.mjs` (debe
 * exportar un objeto plano, se evalúa con Node puro) y el layout raíz
 * (`app/[locale]/layout.tsx`), que la repite en una etiqueta
 * `<meta http-equiv="Content-Security-Policy">`.
 *
 * ¿Por qué repetirla en una etiqueta `<meta>` si ya va en la cabecera HTTP?
 * Porque en producción real (Hostinger) su CDN **sobrescribe la cabecera
 * `Content-Security-Policy`** con la suya propia (`upgrade-insecure-requests`
 * a secas) — confirmado en `docs/QA_DESPLIEGUE_HOSTINGER.md`, hallazgo A1, y
 * sigue así en el sitio en vivo. La etiqueta `<meta>` la genera esta misma
 * app dentro del HTML, así que ningún CDN intermedio puede quitarla: es la
 * única red de seguridad real contra un script inyectado que intente leer o
 * reenviar lo que el visitante escribe en el formulario de cotización.
 *
 * Límite conocido y aceptado: `frame-ancestors` se ignora por especificación
 * cuando la CSP llega por `<meta>` (solo vale por cabecera HTTP). No es un
 * hueco real aquí porque `X-Frame-Options: SAMEORIGIN` sí atraviesa el CDN
 * de Hostinger intacto (confirmado en el mismo informe) y cubre el mismo
 * riesgo de clickjacking por otra vía.
 */
export function buildCspDirectives(isDevelopment) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
    "form-action 'self'",
    "frame-src https://www.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ];
}

export function buildCspHeaderValue(isDevelopment) {
  return buildCspDirectives(isDevelopment).join("; ");
}

/**
 * Variante para `<meta http-equiv>`: sin `frame-ancestors`.
 *
 * El navegador la ignora ahí por especificación y, si se manda igual,
 * registra un error en consola en CADA carga de página — ruido que puede
 * hacer pensar a un futuro desarrollador que algo está roto. `X-Frame-Options`
 * ya cubre ese mismo riesgo por cabecera (ver comentario de arriba), así que
 * no se pierde protección real al quitarla solo de aquí.
 */
export function buildCspMetaValue(isDevelopment) {
  return buildCspDirectives(isDevelopment)
    .filter((directive) => !directive.startsWith("frame-ancestors"))
    .join("; ");
}
