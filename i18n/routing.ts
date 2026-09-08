import { defineRouting } from "next-intl/routing";

/**
 * Locales regionales internos vs. prefijos públicos.
 *
 * Internamente se usan los locales regionales completos (es-US, en-US) porque
 * son los que describen correctamente el mercado (español/inglés de EE. UU.,
 * no de España o Reino Unido) para SEO y `Accept-Language`. Los prefijos
 * públicos de URL se simplifican a /es y /en — nadie escribe "/es-US/" a mano.
 */
export const LOCALES = ["es-US", "en-US"] as const;
export type AppLocale = (typeof LOCALES)[number];

/**
 * Idioma por defecto: hipótesis de trabajo, NO decisión final.
 *
 * El prompt de dirección de arte lo marca explícitamente como pendiente de
 * aprobación del cliente. Houston es un mercado bilingüe; se eligió en-US
 * como valor de arranque configurable, pero todo el sistema (redirect de
 * raíz, metadata, sitemap) debe funcionar igual de bien si cambia a es-US.
 * Cambiar esta única línea reconfigura el sitio entero.
 */
export const DEFAULT_LOCALE: AppLocale = "en-US";

/**
 * Prefijos públicos. DEBEN llevar barra inicial: next-intl los usa tal cual
 * para reconocer la ruta. Sin ella, `/es` no se reconoce como prefijo válido
 * y el proxy le antepone el idioma por defecto, produciendo un bucle infinito
 * (`/en/es` → `/en/en/es` → …). Verificado en pruebas.
 */
export const LOCALE_PREFIXES: Record<AppLocale, string> = {
  "es-US": "/es",
  "en-US": "/en",
};

/** Código corto sin barra, para etiquetas de interfaz (ES | EN). */
export const LOCALE_CODES: Record<AppLocale, string> = {
  "es-US": "es",
  "en-US": "en",
};

/**
 * Registro único de rutas: aquí nace la navegación, el canonical, los
 * hreflang alternates y el sitemap. Si una ruta no está aquí, no existe
 * de forma coherente en el sitio.
 *
 * La ruta interna (clave) es compartida entre idiomas; el valor mapea a la
 * ruta pública por locale. Los slugs dinámicos ([slug]) se resuelven aparte
 * mediante el modelo de contenido (content/projects.ts, content/services.ts).
 */
export const pathnames = {
  "/": "/",
  "/services": { "es-US": "/servicios", "en-US": "/services" },
  "/services/[slug]": { "es-US": "/servicios/[slug]", "en-US": "/services/[slug]" },
  "/projects": { "es-US": "/proyectos", "en-US": "/projects" },
  "/projects/[slug]": { "es-US": "/proyectos/[slug]", "en-US": "/projects/[slug]" },
  "/process": { "es-US": "/proceso", "en-US": "/process" },
  "/about": { "es-US": "/nosotros", "en-US": "/about" },
  "/quote": { "es-US": "/cotizacion", "en-US": "/quote" },
  "/contact": { "es-US": "/contacto", "en-US": "/contact" },
  "/privacy": { "es-US": "/privacidad", "en-US": "/privacy" },
  "/faq": { "es-US": "/preguntas", "en-US": "/faq" },
  "/terms": { "es-US": "/terminos", "en-US": "/terms" },
} satisfies Record<string, string | Record<AppLocale, string>>;

/**
 * Cookie que recuerda el idioma elegido.
 *
 * Se renombró con el cambio de marca: el nombre viaja en cada petición y es
 * visible en las herramientas del navegador, así que dejar ahí la marca
 * anterior era un residuo real.
 *
 * `LEGACY_LOCALE_COOKIE` existe para NO perder la preferencia de quien ya
 * visitó el sitio: `proxy.ts` la traduce a la cookie nueva en la primera
 * petición y borra la vieja. Un renombrado seco habría devuelto a esos
 * visitantes a la detección por Accept-Language, mandando al inglés a quien
 * había elegido español a propósito.
 *
 * La migración puede retirarse pasado un año — la vida de la cookie —, cuando
 * ya no queden navegadores con la clave antigua.
 */
export const LOCALE_COOKIE = "APC_LOCALE";
export const LEGACY_LOCALE_COOKIE = "AMPARGO_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: {
    mode: "always",
    prefixes: LOCALE_PREFIXES,
  },
  pathnames,
  // La cookie propia persiste la elección explícita del visitante y tiene
  // prioridad sobre Accept-Language en visitas siguientes. Ver LOCALE_COOKIE.
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: LOCALE_COOKIE_MAX_AGE,
  },
  localeDetection: true,
});

export type AppPathname = keyof typeof routing.pathnames;

/**
 * Rutas sin parámetros dinámicos.
 *
 * `<Link href="…">` solo acepta una cadena simple cuando la ruta no tiene
 * segmentos `[slug]`; las dinámicas exigen la forma `{ pathname, params }`.
 * Separar los dos tipos hace que el compilador impida el error, en vez de
 * descubrirlo en tiempo de ejecución con un enlace roto.
 */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
