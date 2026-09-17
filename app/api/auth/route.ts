import { NextResponse } from "next/server";
import { OAUTH_ENABLED, buildAuthorizeUrl } from "@/lib/decap-oauth";

const STATE_COOKIE = "decap_oauth_state";

/**
 * Punto de entrada que abre Decap CMS (`auth_endpoint: api/auth` en
 * `public/admin/config.yml`) al pulsar "Login with GitHub". Redirige a
 * GitHub con un `state` de un solo uso guardado en cookie, que
 * `/api/callback` verifica al volver — protección CSRF estándar del flujo
 * OAuth "authorization code", sin necesitar sesión ni base de datos.
 */
export async function GET(request: Request) {
  if (!OAUTH_ENABLED) {
    return NextResponse.json(
      { error: "Faltan GITHUB_OAUTH_CLIENT_ID/GITHUB_OAUTH_CLIENT_SECRET en el servidor." },
      { status: 503 }
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/callback", request.url).toString();
  const response = NextResponse.redirect(buildAuthorizeUrl(state, redirectUri));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 min — de sobra para completar el login, corto para limitar la ventana de reuso.
    path: "/api",
  });
  return response;
}
