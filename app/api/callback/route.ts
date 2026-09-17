import { NextResponse } from "next/server";
import { OAUTH_ENABLED, exchangeCodeForToken, renderOAuthResultPage } from "@/lib/decap-oauth";

const STATE_COOKIE = "decap_oauth_state";

/**
 * A donde GitHub redirige tras el login (debe coincidir EXACTO con la
 * "Authorization callback URL" configurada en la GitHub OAuth App). Cambia
 * el `code` de un solo uso por un token y se lo entrega a la ventana de
 * Decap CMS por `postMessage` — ver `renderOAuthResultPage` para el
 * protocolo exacto.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set(STATE_COOKIE, "", { path: "/api", maxAge: 0 });
    return response;
  };

  if (!OAUTH_ENABLED) {
    return clearStateCookie(
      new NextResponse(renderOAuthResultPage({ error: "oauth_disabled" }), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return clearStateCookie(
      new NextResponse(renderOAuthResultPage({ error: "invalid_state" }), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }

  const redirectUri = new URL("/api/callback", request.url).toString();
  const result = await exchangeCodeForToken(code, redirectUri);
  return clearStateCookie(
    new NextResponse(renderOAuthResultPage(result), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  );
}
