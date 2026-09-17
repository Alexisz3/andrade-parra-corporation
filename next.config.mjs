import createNextIntlPlugin from "next-intl/plugin";
import { buildCspHeaderValue } from "./lib/csp.mjs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * IMPORTANTE (Hostinger): este archivo debe exportar un OBJETO, no una función.
 * Hostinger genera su propia configuración y la fusiona con esta; una función
 * no se fusiona y el despliegue falla. Tampoco renombrar a `next.config.cjs`.
 * `withNextIntl(...)` envuelve el objeto final más abajo — el export sigue
 * siendo el objeto resultante, no una función.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Conserva la URL pública original cuando Proxy realiza la reescritura
  // regional de next-intl. En Next 16 evita que la URL interna normalizada
  // vuelva a entrar al proxy como si fuera una navegación del visitante.
  skipProxyUrlNormalize: true,

  // Codex y las pruebas locales abren la app mediante 127.0.0.1. Next 16
  // bloquea por defecto los chunks de desarrollo si el host no coincide con
  // `localhost`; autorizar solo este loopback mantiene el límite local.
  allowedDevOrigins: ["127.0.0.1"],

  // No anunciar el framework a escáneres automáticos.
  poweredByHeader: false,

  images: {
    // AVIF primero: comprime mejor y degrada con menos artefactos que WebP
    // sobre un JPEG que ya venía recomprimido, que es el caso de estas fotos.
    formats: ["image/avif", "image/webp"],
    // El lote nuevo del cliente llega hasta 2048 px. Incluir 1600 y 2048
    // evita que los heroes de escritorio sirvan una variante innecesariamente
    // pequeña, sin generar escalas superiores a la fuente real.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    imageSizes: [256, 384, 512, 640],
  },

  async rewrites() {
    // `/admin` (sin archivo) -> el shell estático de Decap CMS en
    // `public/admin/index.html`. `/admin/config.yml` y `/admin/decap-cms.js`
    // ya resuelven solos como archivos estáticos de `public/`, sin reescritura.
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },

  async headers() {
    /*
     * CSP aparte para `/admin` (el editor de contenido, Decap CMS).
     *
     * Dos cosas que la CSP estricta del resto del sitio (lib/csp.mjs) no
     * permite y que Decap necesita de verdad, no por descuido: valida
     * `config.yml` contra un esquema JSON compilándolo a una función con
     * `new Function(...)` (ajv) — sin `'unsafe-eval'` esto lanza
     * `EvalError` y el editor no carga nada; y su backend `github` llama a
     * `api.github.com` directamente desde el navegador con el token del
     * usuario (nuestro servidor solo hace el intercambio OAuth, no
     * intermedia cada operación de guardado) — sin `connect-src
     * api.github.com` esas llamadas quedan bloqueadas.
     *
     * Por eso esta política vive separada de `buildCspHeaderValue`, y por
     * eso la regla general de abajo EXCLUYE `/admin` (`(?!admin)`) en vez de
     * sumarse a esta: dos cabeceras `Content-Security-Policy` para la misma
     * respuesta no se combinan, el navegador aplica la INTERSECCIÓN de
     * ambas — agregar esta cabecera sin excluir la otra habría dejado todo
     * igual de bloqueado.
     */
    const adminCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://*.githubusercontent.com",
      "connect-src 'self' https://api.github.com https://github.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; ");
    const adminHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: adminCsp },
    ];

    return [
      // El shell HTML se pide como "/admin" literal (el rewrite de arriba
      // es interno); los archivos que carga (`config.yml`, `decap-cms.js`,
      // los `.wasm`) se piden como "/admin/<archivo>" — de ahí las dos reglas.
      { source: "/admin", headers: adminHeaders },
      { source: "/admin/:path*", headers: adminHeaders },
      {
        source: "/((?!admin).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          /*
           * Política de seguridad de contenido.
           *
           * Faltaba por completo: sin ella, cualquier script inyectado —por
           * una dependencia comprometida o una extensión— puede exfiltrar lo
           * que el visitante escriba en el formulario de cotización, que es
           * justo donde deja su nombre y su teléfono.
           *
           * `'unsafe-inline'` en script-src es obligado mientras GA4 se
           * inicialice con un <script> en línea, y Next inyecta además su
           * propio bootstrap. Sustituirlo por nonces exige mover la analítica
           * a un archivo aparte; queda anotado, no fingido.
           *
           * `frame-ancestors 'none'` es la versión moderna de X-Frame-Options
           * y protege contra clickjacking sobre el formulario.
           */
          {
            /*
             * Política de seguridad de contenido — el valor sale de
             * lib/csp.mjs, fuente única compartida con el `<meta
             * http-equiv>` del layout raíz. Ver ese archivo para el porqué
             * de la duplicación (Hostinger sobrescribe esta cabecera en
             * producción) y para el detalle de cada directiva.
             *
             * SIN `upgrade-insecure-requests`: reescribe TODA petición
             * http:// a https://, incluido `http://127.0.0.1`. WebKit no
             * exime localhost, así que la hoja de estilos no cargaba en
             * pruebas locales — sin CSS la cabecera perdía `position: fixed`
             * y las tarjetas quedaban por encima del selector de idioma. Lo
             * delató la suite en WebKit; Chromium y Firefox lo toleraban en
             * silencio. En Vercel es además redundante: sirve solo HTTPS con
             * HSTS y no hay ningún recurso en http:// que reescribir.
             */
            key: "Content-Security-Policy",
            value: buildCspHeaderValue(isDevelopment),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
