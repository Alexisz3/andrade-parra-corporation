import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import {
  routing,
  LOCALE_COOKIE,
  LEGACY_LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
} from "./i18n/routing";

/**
 * Next.js 16 renombró `middleware.ts` a `proxy.ts` (el runtime `edge` ya no
 * se admite aquí; el runtime de `proxy` es `nodejs` y no es configurable).
 * `next-intl` sigue exponiendo `createMiddleware`, pero el archivo debe
 * llamarse `proxy.ts` para que Next 16 lo reconozca.
 */
const handleLocale = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  /*
   * Migración de la cookie de idioma tras el cambio de marca.
   *
   * Quien ya visitó el sitio trae `AMPARGO_LOCALE`. Si simplemente
   * renombráramos la clave, next-intl no encontraría preferencia guardada y
   * volvería a detectar por Accept-Language: un visitante que había elegido
   * español a propósito acabaría en inglés sin haber tocado nada.
   *
   * Se copia el valor a la clave nueva ANTES de delegar, para que next-intl
   * lo vea ya en esta misma petición y no solo en la siguiente.
   */
  const legacy = request.cookies.get(LEGACY_LOCALE_COOKIE)?.value;
  const current = request.cookies.get(LOCALE_COOKIE)?.value;
  const migrating = Boolean(legacy) && !current;

  if (migrating && legacy) {
    request.cookies.set(LOCALE_COOKIE, legacy);
  }

  const response = handleLocale(request);

  if (migrating && legacy) {
    response.cookies.set(LOCALE_COOKIE, legacy, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    // La antigua ya no sirve: se retira para no arrastrar dos cookies.
    response.cookies.delete(LEGACY_LOCALE_COOKIE);
  }

  return response;
}

export const config = {
  // Excluye API, `/admin` (el shell de Decap CMS — sin esto, next-intl lo
  // redirige a una ruta con prefijo de idioma antes de que aplique el
  // rewrite de next.config.mjs), internals de Next, Vercel y cualquier
  // archivo con extensión (favicon, robots.txt, sitemap.xml, imágenes
  // servidas por next/image…).
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
