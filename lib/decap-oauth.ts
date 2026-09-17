/**
 * Intercambio OAuth con GitHub para el backend `github` de Decap CMS
 * (`public/admin/config.yml`). Decap necesita un servidor propio para este
 * paso porque el `client_secret` no puede vivir en el navegador — mismo
 * motivo por el que `lib/mail.ts` centraliza `RESEND_API_KEY` en vez de
 * dejar que la ruta lo lea directamente.
 *
 * El repo (`Alexisz3/andrade-parra-corporation`) es público, así que se pide
 * `public_repo` en vez de `repo` — el mínimo alcance que permite escribir en
 * repos públicos del usuario autenticado, sin pedir acceso a sus repos
 * privados.
 */

export const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

export const OAUTH_ENABLED = !!(GITHUB_OAUTH_CLIENT_ID && GITHUB_OAUTH_CLIENT_SECRET);

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export function buildAuthorizeUrl(state: string, redirectUri: string): string {
  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "public_repo");
  url.searchParams.set("state", state);
  return url.toString();
}

export type TokenExchangeResult = { token: string } | { error: string };

/**
 * Cambia el `code` de un solo uso por un token de acceso. Lanza si
 * `OAUTH_ENABLED` es falso — quien llama debe comprobarlo antes (igual que
 * `sendQuoteEmail`/`EMAIL_ENABLED`).
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenExchangeResult> {
  if (!OAUTH_ENABLED) {
    throw new Error("OAUTH_ENABLED es falso: falta GITHUB_OAUTH_CLIENT_ID o GITHUB_OAUTH_CLIENT_SECRET.");
  }

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_OAUTH_CLIENT_ID,
      client_secret: GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    return { error: `github_token_http_${response.status}` };
  }

  const data: { access_token?: string; error?: string; error_description?: string } = await response.json();
  if (!data.access_token) {
    return { error: data.error_description || data.error || "no_access_token" };
  }
  return { token: data.access_token };
}

/**
 * HTML mínimo que completa el protocolo de Decap/Netlify CMS para su
 * ventana emergente de login: primero avisa que está listo
 * (`authorizing:github`), y cuando la ventana principal responde, le manda
 * el resultado (`authorization:github:success:<json>` o `:error:<mensaje>`)
 * por `postMessage`. Decap escucha exactamente estos mensajes; el formato
 * no es negociable.
 */
export function renderOAuthResultPage(result: TokenExchangeResult): string {
  const message =
    "token" in result
      ? `authorization:github:success:${JSON.stringify({ token: result.token, provider: "github" })}`
      : `authorization:github:error:${JSON.stringify({ message: result.error })}`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Autenticación</title></head>
<body>
<script>
(function () {
  function receiveMessage() {
    window.opener.postMessage(${JSON.stringify(message)}, "*");
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body></html>`;
}
