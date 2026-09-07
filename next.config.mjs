import createNextIntlPlugin from "next-intl/plugin";

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

  async headers() {
    return [
      {
        source: "/:path*",
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
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Google Analytics y Tag Manager, solo si se configura el ID.
              `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              // `data:` y `blob:` los necesita next/image y la previsualización
              // de las fotos de referencia antes de enviarlas.
              "img-src 'self' data: blob: https://www.google-analytics.com",
              "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
              /*
               * SIN `upgrade-insecure-requests`.
               *
               * La directiva reescribe TODA petición http:// a https://,
               * incluido `http://127.0.0.1`. WebKit no exime localhost, así
               * que la hoja de estilos no cargaba en pruebas locales: sin CSS
               * la cabecera perdía `position: fixed` y las tarjetas quedaban
               * por encima del selector de idioma. Lo delató la suite en
               * WebKit; Chromium y Firefox lo toleraban en silencio.
               *
               * En Vercel es además redundante: sirve solo HTTPS con HSTS y
               * no hay ningún recurso en http:// que reescribir.
               */
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
