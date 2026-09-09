/**
 * QA funcional multipágina. Ejecutar contra el build de producción:
 *   node qa/functional.mjs [baseUrl]
 */
import { chromium, firefox, webkit } from "playwright";

const URL = process.argv[2] ?? "http://127.0.0.1:4318";
const results = [];

function check(name, passed, detail = "") {
  results.push({ name, passed });
  console.log(`${passed ? "OK   " : "FALLA"} ${name}${detail ? " — " + detail : ""}`);
}

const ENGINE = process.env.QA_BROWSER ?? "chromium";
const engines = { chromium, firefox, webkit };
const browser = await engines[ENGINE].launch();
console.log(`--- motor: ${ENGINE} ---`);

// ─── 1. Enrutado por idioma y detección ─────────────────────────────────
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  const redirect = async (headers) => {
    const r = await p.request.get(URL + "/", { headers, maxRedirects: 0 });
    return { status: r.status(), location: r.headers()["location"] ?? "" };
  };

  let r = await redirect({ "Accept-Language": "es" });
  check("Raíz: Accept-Language es → /es", r.status === 307 && r.location.endsWith("/es"), `${r.status} ${r.location}`);

  r = await redirect({ "Accept-Language": "en-US" });
  check("Raíz: Accept-Language en → /en", r.status === 307 && r.location.endsWith("/en"), `${r.status} ${r.location}`);

  r = await redirect({ "Accept-Language": "fr" });
  check("Raíz: idioma no soportado → fallback /en", r.status === 307 && r.location.endsWith("/en"), `${r.status} ${r.location}`);

  r = await redirect({ "Accept-Language": "en-US", Cookie: "APC_LOCALE=es-US" });
  check("Raíz: cookie es vence a cabecera en", r.status === 307 && r.location.endsWith("/es"), `${r.status} ${r.location}`);

  /*
   * Migración de la cookie tras el cambio de marca.
   *
   * Un visitante que eligió español antes del rebranding trae la clave
   * antigua. Debe seguir aterrizando en /es pese a tener el navegador en
   * inglés, y salir de la petición con la clave nueva escrita y la vieja
   * borrada. Sin esta prueba, un futuro "ya no hace falta la migración"
   * pasaría desapercibido hasta que los visitantes recurrentes acabaran en
   * el idioma equivocado.
   */
  r = await redirect({ "Accept-Language": "en-US", Cookie: "AMPARGO_LOCALE=es-US" });
  check(
    "Idioma: la cookie anterior al rebranding conserva la preferencia",
    r.status === 307 && r.location.endsWith("/es"),
    `${r.status} ${r.location}`
  );
  {
    const res = await p.request.get(URL + "/", {
      headers: { "Accept-Language": "en-US", Cookie: "AMPARGO_LOCALE=es-US" },
      maxRedirects: 0,
    });
    const setCookies = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie");
    const writesNew = setCookies.some((h) => /APC_LOCALE=es-US/.test(h.value));
    const clearsOld = setCookies.some((h) => /AMPARGO_LOCALE=;/.test(h.value));
    check(
      "Idioma: migra a la cookie nueva y retira la antigua",
      writesNew && clearsOld,
      `nueva:${writesNew} borra-antigua:${clearsOld}`
    );
  }

  const explicit = await p.request.get(URL + "/en", {
    headers: { Cookie: "APC_LOCALE=es-US" },
    maxRedirects: 0,
  });
  check("Prefijo explícito /en vence a cookie es", explicit.status() === 200, String(explicit.status()));

  await ctx.close();
}

// ─── 2. HTML localizado sin JavaScript ──────────────────────────────────
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();

  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  const esHtml = await p.content();
  check("Sin JS: /es sirve lang=es-US", (await p.getAttribute("html", "lang")) === "es-US");
  check("Sin JS: /es contiene copy en español", esHtml.includes("Solicitar cotización"));

  await p.goto(URL + "/en", { waitUntil: "domcontentloaded" });
  const enHtml = await p.content();
  check("Sin JS: /en sirve lang=en-US", (await p.getAttribute("html", "lang")) === "en-US");
  check("Sin JS: /en contiene copy en inglés", enHtml.includes("Request a quote"));
  check("Sin JS: /en NO contiene copy español", !enHtml.includes("Solicitar cotización"));

  check("SEO: canonical presente", enHtml.includes('rel="canonical"'));
  // El atributo puede serializarse como `hrefLang` o `hreflang` según el
  // motor; se compara en minúsculas para no depender de eso.
  const lower = enHtml.toLowerCase();
  check("SEO: hreflang recíprocos (es-US, en-US, x-default)",
    lower.includes('hreflang="es-us"') && lower.includes('hreflang="en-us"') && lower.includes('hreflang="x-default"'));

  await ctx.close();
}

// ─── 3. Selector de idioma preserva la página ───────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  /*
   * Se espera la CONDICIÓN (el cambio de URL), no un tiempo fijo. Con
   * `waitForTimeout` la prueba era inestable en WebKit, que hidrata más
   * despacio: el clic llegaba antes de que el manejador estuviera montado.
   */
  const switchLocale = async (from, expected) => {
    await p.goto(URL + from, { waitUntil: "domcontentloaded" });
    const trigger = p.locator(".v7-language-trigger");
    await trigger.waitFor({ state: "visible" });
    // Enabled + un frame de margen asegura que React ya asoció el onClick.
    await p.waitForFunction(() => document.readyState === "complete");
    await trigger.click();
    const toggle = p.locator('[role="menuitemradio"]', { hasText: "EN" });
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    try {
      await p.waitForURL((u) => u.pathname.endsWith(expected), { timeout: 10000 });
    } catch {
      /* el check de abajo reporta la URL real alcanzada */
    }
    return p.url();
  };

  let url = await switchLocale("/es/proyectos", "/en/projects");
  check("Selector: /es/proyectos → /en/projects (misma página)", url.endsWith("/en/projects"), url);

  url = await switchLocale("/es/cotizacion", "/en/quote");
  check("Selector: /es/cotizacion → /en/quote", url.endsWith("/en/quote"), url);

  await ctx.close();
}

// ─── 4. Navegación multipágina ──────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);

  await p.locator("header nav a", { hasText: "Proyectos" }).click();
  await p.waitForTimeout(1500);
  check("Nav: Proyectos abre /es/proyectos", p.url().includes("/es/proyectos"), p.url());
  check("Nav: el idioma se conserva al navegar", (await p.getAttribute("html", "lang")) === "es-US");

  await ctx.close();
}

// ─── 5. Menú móvil accesible ────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  check("Móvil: el foco NO se roba al cargar",
    await p.evaluate(() => document.activeElement === document.body || document.activeElement === document.documentElement));

  const trigger = p.locator('header button[aria-controls="menu-movil"]');
  await trigger.click();
  await p.waitForTimeout(600);
  const dialog = p.locator('[role="dialog"][aria-modal="true"]');
  check("Móvil: abre diálogo modal", (await dialog.count()) === 1);
  check("Móvil: el foco entra al panel",
    await p.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')));
  check("Móvil: bloquea scroll del fondo",
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden");

  await p.keyboard.press("Escape");
  await p.waitForTimeout(600);
  check("Móvil: Escape cierra", (await dialog.count()) === 0);
  check("Móvil: el foco vuelve al disparador",
    await p.evaluate(() => document.activeElement?.getAttribute("aria-controls") === "menu-movil"));
  check("Móvil: scroll del fondo restaurado",
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden");

  await ctx.close();
}

// Flujo retirado: se conserva temporalmente como historial de regresiones
// mientras la V7 reemplaza el stepper por un formulario de una sola vista.
// No se ejecuta en CI.
// ─── 6. Cotización: flujo anterior de dos etapas ────────────────────────
if (process.env.QA_LEGACY_QUOTE_FLOW === "1") {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  /** Rellena la etapa de contacto. `phone`/`email` a "" para omitirlos. */
  const fillContact = async (page, { name = "Kevin Prueba", phone = "8325551234", email = "" } = {}) => {
    await page.locator("#name").fill(name);
    await page.locator("#phone").fill(phone);
    await page.locator("#email").fill(email);
    await page.locator('input[name="channel"]').last().check();
    await page.locator("#consent").setChecked(true);
  };

  /** Intercepta window.open y devuelve la URL de wa.me, o null si se bloqueó. */
  const submit = async (page) => {
    await page.evaluate(() => {
      window.__opened = null;
      window.open = (u) => { window.__opened = u; return null; };
    });
    await page.locator("button", { hasText: /Enviar por WhatsApp|Send by WhatsApp/ }).click();
    await page.waitForTimeout(500);
    return page.evaluate(() => window.__opened);
  };

  await p.goto(URL + "/es/cotizacion", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  check("Cotización: 2 etapas visibles", (await p.locator("ol button").count()) === 2);
  check("Cotización: arranca en la etapa 1", await p.locator('[aria-current="step"]').isVisible());
  check(
    "Cotización: ya no existe el paso de fotos",
    !/agregue imágenes|reference images|arrastre sus archivos/i.test(await p.locator("main").innerText())
  );

  /*
   * La descripción es obligatoria. Se comprueba por los DOS caminos, porque
   * el botón "Continuar" sí la exigía y el stepper no: pulsando el círculo de
   * la última etapa se llegaba al envío y salía una solicitud sin proyecto,
   * que el contratista no puede responder.
   */
  check(
    "Cotización: bloquea avanzar sin describir el proyecto",
    await (async () => {
      await p.locator("button", { hasText: "Continuar" }).click();
      await p.waitForTimeout(400);
      return p.locator('[role="alert"]').first().isVisible();
    })()
  );

  check(
    "Cotización: el stepper NO deja saltar a la última etapa con la primera vacía",
    await (async () => {
      await p.locator("ol button").nth(1).click();
      await p.waitForTimeout(400);
      const stillFirst = (await p.locator("#description").count()) === 1;
      const announced = await p.locator('[role="alert"]').first().isVisible();
      const focused = await p.evaluate(() => document.activeElement?.id);
      return stillFirst && announced && focused === "description";
    })(),
    "etapa 1 + alerta + foco en el campo que falta"
  );

  await p.locator("#description").fill("Remodelación de cocina de 20 m2");
  await p.locator("button", { hasText: "Continuar" }).click();
  await p.waitForTimeout(600);
  check("Cotización: avanza a Contacto", (await p.locator("#name").count()) === 1);

  const radios = p.locator('input[name="channel"]');
  check("Cotización: canal con 2 radios excluyentes", (await radios.count()) === 2);
  await radios.first().check();
  await p.waitForTimeout(200);
  await radios.last().check();
  await p.waitForTimeout(200);
  check("Cotización: solo un canal puede estar activo",
    (await p.locator('input[name="channel"]:checked').count()) === 1);

  const text = (await p.locator("main").innerText()).toLowerCase();
  check("Cotización: NO afirma envío que no ocurrió",
    !/solicitud enviada|mensaje enviado|hemos recibido|request sent|we received/.test(text));
  check("Cotización: sin aviso de modo desarrollo en producción",
    !/modo de desarrollo|development mode/.test(text));
  check("Cotización: existe acción de envío",
    (await p.locator("button", { hasText: /Enviar por WhatsApp|Send by WhatsApp/ }).count()) === 1);

  check("Cotización: bloquea el envío sin datos de contacto",
    await (async () => {
      const opened = await submit(p);
      return opened === null && (await p.locator('[role="alert"]').count()) >= 3;
    })());

  // Teléfono O correo, indistintamente: exigir ambos pierde solicitudes.
  await fillContact(p, { phone: "8325551234", email: "" });
  check("Cotización: teléfono sin correo se admite", (await submit(p)) !== null);

  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  await fillContact(p, { phone: "", email: "cliente@example.com" });
  check("Cotización: correo sin teléfono se admite", (await submit(p)) !== null);

  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  await fillContact(p, { phone: "", email: "" });
  check("Cotización: sin teléfono NI correo se bloquea", (await submit(p)) === null);

  await ctx.close();
}

// ─── 6b. Flujo anterior: mensaje y reparto ──────────────────────────────
if (process.env.QA_LEGACY_QUOTE_FLOW === "1") {
  /**
   * Recorrido completo de una solicitud, en un contexto RECIÉN CREADO.
   *
   * Un contexto nuevo trae `sessionStorage` vacío por construcción, y eso es
   * justo lo que hace falta aquí. La versión anterior reutilizaba una pestaña
   * y limpiaba el almacenamiento antes de recargar; parecía equivalente y no
   * lo era. El formulario restaura el borrador al montar y lo vuelve a
   * guardar en cuanto cambia el estado, así que entre el `clear()` y la
   * recarga hay una ventana en la que la aplicación puede reescribirlo. Si
   * hidrataba dentro de esa ventana, la vuelta siguiente arrancaba en la
   * etapa de contacto y no existía ningún `#description` que rellenar.
   *
   * En local nunca falló y en CI sí: el runner es más lento y la hidratación
   * caía dentro de la ventana. Una prueba que depende de quién gana una
   * carrera no está midiendo lo que dice medir, así que se retira la carrera
   * en vez de ensancharle los tiempos de espera.
   *
   * Devuelve la URL de wa.me y el texto de la confirmación, porque el
   * contexto se cierra aquí dentro y después ya no hay página que leer.
   */
  /**
   * Escribe en un campo y comprueba que el valor SE QUEDA.
   *
   * Los campos existen en el HTML del servidor antes de que React hidrate, y
   * son componentes controlados: al hidratar, React impone el valor de su
   * estado —vacío— y borra lo que se hubiera escrito antes. El síntoma es
   * desconcertante, porque no falla al escribir: falla después, al pulsar
   * "Continuar", con un error de validación sobre un campo que en la captura
   * se ve relleno. Reintentar el clic no arregla nada, porque el problema no
   * está en el clic.
   *
   * Se ve en WebKit, que hidrata bastante más despacio que Chromium.
   */
  /**
   * Pulsa y comprueba que el clic SURTIÓ EFECTO; si no, vuelve a pulsar.
   *
   * Hace falta porque el botón existe en el HTML del servidor antes de que
   * React le ate el manejador: un clic en esa ventana no hace nada y no falla
   * —simplemente se pierde—. WebKit hidrata bastante más despacio que
   * Chromium y es donde se ve; el mismo archivo ya lo sufrió en el selector
   * de idioma, ver la sección 3.
   *
   * Esperar un tiempo fijo "suficiente" es lo que se hacía antes y es
   * precisamente lo que convierte una prueba en una apuesta: en una máquina
   * más lenta el margen deja de bastar. Aquí se espera a la CONSECUENCIA.
   */
  const fillSticky = async (page, campo, valor, intentos = 5) => {
    for (let i = 0; i < intentos; i++) {
      await campo.fill(valor);
      // Si el valor sobrevive un instante, React ya está al mando del campo.
      await page.waitForTimeout(150);
      if ((await campo.inputValue()) === valor) return;
    }
    throw new Error(`El campo no retuvo el valor tras ${intentos} intentos: ${valor}`);
  };

  const clickUntil = async (page, button, expected, intentos = 4) => {
    for (let i = 0; i < intentos; i++) {
      await button.click();
      try {
        await expected.waitFor({ state: "visible", timeout: 4000 });
        return;
      } catch {
        /* la hidratación aún no había llegado: se reintenta */
      }
    }
    // Último intento sin capturar, para que el error diga qué se esperaba.
    await expected.waitFor({ state: "visible", timeout: 10000 });
  };

  const sendOne = async ({ name, phone, description, locale = "es" }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${URL}/${locale}/${locale === "es" ? "cotizacion" : "quote"}`, {
        waitUntil: "domcontentloaded",
      });
      // Se espera al campo, no a un tiempo fijo: el runner de CI hidrata más
      // despacio que una máquina de desarrollo.
      await page.locator("#description").waitFor({ state: "visible" });
      await fillSticky(page, page.locator("#description"), description);
      await clickUntil(
        page,
        page.locator("button", { hasText: /Continuar|Continue/ }),
        page.locator("#name")
      );

      await fillSticky(page, page.locator("#name"), name);
      await fillSticky(page, page.locator("#phone"), phone);
      await page.locator('input[name="channel"]').last().check();
      await page.locator("#consent").setChecked(true);

      await page.evaluate(() => {
        window.__opened = null;
        window.open = (u) => { window.__opened = u; return null; };
      });
      // La confirmación aparece cuando el enlace ya está compuesto.
      await clickUntil(
        page,
        page.locator("button", { hasText: /Enviar por WhatsApp|Send by WhatsApp/ }),
        page.locator('[role="status"]')
      );
      return {
        url: await page.evaluate(() => window.__opened),
        confirmation: await page.locator('[role="status"]').innerText(),
      };
    } finally {
      await ctx.close();
    }
  };

  const first = { name: "María Fernández", phone: "8325550101", description: "Remodelación de cocina con isla" };
  const primera = await sendOne(first);
  const url = primera.url;
  const message = decodeURIComponent((url ?? "").split("?text=")[1] ?? "");

  check("Mensaje: lleva proyecto, nombre y teléfono",
    /Proyecto: Remodelación de cocina con isla/.test(message) &&
    /Nombre: María Fernández/.test(message) &&
    /Teléfono: 8325550101/.test(message), message.replace(/\n/g, " | "));
  check("Mensaje: acentos y eñes bien codificados",
    (url ?? "").includes("%C3%B3") && !/Ã/.test(message));

  /*
   * Ninguna mención a fotos. El mensaje prometía "fotos de referencia listas
   * para enviar" y no llegaba ninguna: `wa.me` solo admite texto. El
   * contratista leía que había fotos y no las había.
   */
  check("Mensaje: NO promete fotos que no viajan",
    !/foto|photo/i.test(message), message.replace(/\n/g, " | "));

  /*
   * El texto es genérico a propósito desde que existen dos canales de
   * entrega (WhatsApp y correo): "este mismo mensaje" sirve para una
   * conversación de WhatsApp y para un correo por igual, sin mencionar
   * ninguno de los dos por nombre. Ver lib/email.ts y QuoteShell.tsx.
   */
  check("Confirmación: invita a adjuntar las fotos en el mensaje (ES)",
    /adjúntelas a este mismo mensaje/i.test(primera.confirmation));

  /*
   * Reparto entre los dos contactos. `lib/assignment.ts` existía y no lo
   * llamaba nadie: el formulario mandaba siempre al primer número y el
   * segundo contacto no recibía ninguna solicitud. Se comprueba de punta a
   * punta —no solo la función— porque el defecto estaba justo en el cable.
   */
  const targets = new Set();
  const lote = [
    first,
    { name: "John Smith", phone: "7135550102", description: "Bathroom remodel, master suite" },
    { name: "Luis Peña", phone: "2815550103", description: "Ampliación de cochera" },
    { name: "Sarah Johnson", phone: "8325550104", description: "Kitchen countertops and backsplash" },
    { name: "Ramón Ortiz", phone: "8325550105", description: "Techo y estructura de patio" },
    { name: "Emily Davis", phone: "9365550106", description: "Full interior repaint and floors" },
  ];
  targets.add((url ?? "").match(/wa\.me\/(\d+)/)?.[1]);
  for (const req of lote.slice(1)) {
    const { url: u } = await sendOne(req);
    targets.add((u ?? "").match(/wa\.me\/(\d+)/)?.[1]);
  }
  check("Reparto: un lote variado llega a AMBOS contactos", targets.size === 2,
    [...targets].join(" y "));

  const repeat = await sendOne(first);
  check("Reparto: la misma solicitud abre siempre el mismo contacto",
    repeat.url?.match(/wa\.me\/(\d+)/)?.[1] === url?.match(/wa\.me\/(\d+)/)?.[1]);

  const en = await sendOne({ name: "John Smith", phone: "7135550102", description: "Bathroom remodel", locale: "en" });
  check("Confirmación: invita a adjuntar las fotos en el mensaje (EN)",
    /attach them to this same message/i.test(en.confirmation));

  /*
   * Canal de correo. Existía la opción, el visitante podía elegirla, y se le
   * abría WhatsApp igual — el canal solo se usaba para validar y para
   * tracking, nunca para la entrega real. Se prueba de punta a punta, como
   * el reparto de arriba, porque el defecto estaba en el cable, no en una
   * función aislada.
   *
   * `mailto:` no pasa por `window.open` —se navega con `window.location.href`
   * para no dejar una pestaña en blanco huérfana—, así que aquí no se
   * intercepta `window.open` como en `sendOne`: se lee directamente el
   * `href` del enlace "abrir de nuevo" que la propia confirmación deja en el
   * DOM.
   */
  const ctxEmail = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageEmail = await ctxEmail.newPage();
  try {
    await pageEmail.goto(`${URL}/es/cotizacion`, { waitUntil: "domcontentloaded" });
    await pageEmail.locator("#description").waitFor({ state: "visible" });
    await fillSticky(pageEmail, pageEmail.locator("#description"), "Prueba de canal de correo");
    await clickUntil(
      pageEmail,
      pageEmail.locator("button", { hasText: /Continuar|Continue/ }),
      pageEmail.locator("#name")
    );
    await fillSticky(pageEmail, pageEmail.locator("#name"), "Prueba Correo");
    await fillSticky(pageEmail, pageEmail.locator("#phone"), "8325550199");
    await pageEmail.locator('input[name="channel"]').first().check(); // "email" es la primera opción
    await pageEmail.locator("#consent").setChecked(true);

    const sendButton = pageEmail.locator("button", { hasText: /Enviar por correo|Send by email/ });
    check("Botón de envío dice \"correo\" cuando el canal elegido es correo",
      await sendButton.count() === 1);

    await clickUntil(pageEmail, sendButton, pageEmail.locator('[role="status"]'));

    const mailtoHref = await pageEmail.locator('[role="status"] a').getAttribute("href");
    check("Correo: el enlace es un mailto: al buzón correcto",
      mailtoHref?.startsWith("mailto:contacto@ampargo.com?") ?? false, mailtoHref ?? "(sin enlace)");
    check("Correo: el asunto y el cuerpo van codificados, no en blanco",
      /subject=\S+&body=\S+/.test(mailtoHref ?? ""));

    const statusText = await pageEmail.locator('[role="status"]').innerText();
    check("Correo: la confirmación es la de correo, no la de WhatsApp",
      /correo/i.test(statusText) && !/WhatsApp/i.test(statusText), statusText.replace(/\n/g, " | "));
  } finally {
    await ctxEmail.close();
  }
}

// ─── 6c. Flujo anterior: borrador de tres etapas ────────────────────────
if (process.env.QA_LEGACY_QUOTE_FLOW === "1") {
  /*
   * Alguien con la pestaña abierta durante el despliegue trae en
   * `sessionStorage` un borrador con `step: 3`, etapa que ya no existe. Sin
   * acotar el valor, el formulario no pintaba NINGUNA etapa: un hueco en
   * blanco entre los botones, con el stepper señalando un círculo inexistente.
   */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es/cotizacion", { waitUntil: "domcontentloaded" });
  await p.evaluate(() => {
    window.sessionStorage.setItem("apc-quote-draft", JSON.stringify({
      service: "", location: "Houston, TX 77002", description: "Baño completo",
      photoCount: 4, name: "Ana", phone: "8325550001", email: "",
      channel: "whatsapp", consent: true, step: 3,
    }));
  });
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  check("Borrador antiguo (step 3): cae a la última etapa real, no a un hueco",
    (await p.locator("#name").count()) === 1 &&
    // El botón activo lleva el número y, en pantalla ancha, también la
    // etiqueta: basta con que empiece por el número de la última etapa real.
    (await p.locator('[aria-current="step"]').innerText()).trim().startsWith("2"),
    (await p.locator('[aria-current="step"]').innerText()).replace(/\s+/g, " "));
  check("Borrador antiguo: conserva lo escrito", (await p.locator("#name").inputValue()) === "Ana");
  check("Borrador antiguo: el conteo de fotos no reaparece",
    !/imágenes de referencia|reference images/i.test(await p.locator("main").innerText()));

  await ctx.close();
}

// ─── 6d. Cotización V7: una vista, validación y reparto ─────────────────
{
  const fillSticky = async (page, field, value, attempts = 5) => {
    for (let i = 0; i < attempts; i++) {
      await field.fill(value);
      await page.waitForTimeout(100);
      if ((await field.inputValue()) === value) return;
    }
    throw new Error(`El campo no retuvo el valor: ${value}`);
  };

  const sendOne = async ({ name, phone, description, locale = "es" }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${URL}/${locale}/${locale === "es" ? "cotizacion" : "quote"}`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator("#description").waitFor({ state: "visible" });
      // The draft effect is a public, observable hydration signal. Avoid
      // filling SSR controls before React has attached their change handlers.
      await page.waitForFunction(() => sessionStorage.getItem("apc-quote-draft") !== null);
      await fillSticky(page, page.locator("#description"), description);
      await fillSticky(page, page.locator("#name"), name);
      await fillSticky(page, page.locator("#phone"), phone);
      await page.locator("#consent").setChecked(true);
      await page.evaluate(() => {
        window.__opened = null;
        window.open = (url) => { window.__opened = url; return null; };
      });
      await page.locator("button[type='submit']").click();
      await page.locator('[role="status"]').waitFor({ state: "visible" });
      return {
        url: await page.evaluate(() => window.__opened),
        status: await page.locator('[role="status"]').innerText(),
      };
    } finally {
      await ctx.close();
    }
  };

  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es/cotizacion", { waitUntil: "networkidle" });
  await p.locator("#description").waitFor({ state: "visible" });

  check("Cotización V7: todos los campos están en una sola vista",
    (await p.locator("#name,#phone,#email,#service,#location,#description,#consent").count()) === 7);
  check("Cotización V7: no conserva stepper ni carga ficticia de fotos",
    (await p.locator('[aria-current="step"]').count()) === 0 &&
    !/arrastre sus archivos|drag your files/i.test(await p.locator("main").innerText()));
  check("Cotización V7: ofrece contacto directo con Jose y Mario",
    (await p.locator('.v7-quote-contact-lines a[href^="tel:"]').count()) === 2);

  await p.locator(".v7-quote-form").evaluate((form) => form.requestSubmit());
  await p.locator("#description[aria-invalid='true']").waitFor({ state: "visible" });
  check("Cotización V7: valida y anuncia los datos faltantes",
    (await p.locator('[role="alert"]').count()) >= 1 &&
    (await p.locator("#description").getAttribute("aria-invalid")) === "true");
  check("Cotización V7 móvil: no tiene desbordamiento horizontal",
    await p.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await ctx.close();

  const request = {
    name: "María Fernández",
    phone: "8325550101",
    description: "Remodelación de cocina con isla",
  };
  const first = await sendOne(request);
  const message = decodeURIComponent((first.url ?? "").split("?text=")[1] ?? "");
  check("Cotización V7: prepara un mensaje completo y bien codificado",
    /Proyecto: Remodelación de cocina con isla/.test(message) &&
    /Nombre: María Fernández/.test(message) &&
    /Teléfono: 8325550101/.test(message) && !/Ã/.test(message));
  check("Cotización V7: explica con honestidad que aún debe pulsar Enviar",
    /no se ha enviado nada/i.test(first.status));

  const targets = new Set();
  for (const item of [
    request,
    { name: "John Smith", phone: "7135550102", description: "Bathroom remodel" },
    { name: "Luis Peña", phone: "2815550103", description: "Ampliación de cochera" },
    { name: "Sarah Johnson", phone: "8325550104", description: "Kitchen remodel" },
    { name: "Ramón Ortiz", phone: "8325550105", description: "Techo y estructura de patio" },
    { name: "Emily Davis", phone: "9365550106", description: "Full interior repaint and floors" },
  ]) {
    const result = item === request ? first : await sendOne(item);
    targets.add((result.url ?? "").match(/wa\.me\/(\d+)/)?.[1]);
  }
  check("Cotización V7: distribuye solicitudes entre ambos contactos", targets.size === 2,
    [...targets].join(" y "));

  const repeat = await sendOne(request);
  check("Cotización V7: una misma solicitud conserva su contacto",
    repeat.url?.match(/wa\.me\/(\d+)/)?.[1] === first.url?.match(/wa\.me\/(\d+)/)?.[1]);

  const legacy = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const legacyPage = await legacy.newPage();
  await legacyPage.goto(URL + "/es/cotizacion", { waitUntil: "networkidle" });
  await legacyPage.evaluate(() => sessionStorage.setItem("apc-quote-draft", JSON.stringify({
    location: "Houston, TX 77002", description: "Baño completo", photoCount: 4,
    name: "Ana", phone: "8325550001", channel: "whatsapp", consent: true, step: 3,
  })));
  await legacyPage.reload({ waitUntil: "networkidle" });
  await legacyPage.locator("#name").waitFor({ state: "visible" });
  check("Cotización V7: recupera un borrador anterior sin dejar huecos",
    (await legacyPage.locator("#name").inputValue()) === "Ana" &&
    (await legacyPage.locator("#description").inputValue()) === "Baño completo");
  await legacy.close();
}

// ─── 7. Movimiento reducido ─────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(500);
  const opacity = await p.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? getComputedStyle(h1).opacity : "0";
  });
  check("Movimiento reducido: contenido visible de inmediato", Number(opacity) > 0.95, `opacidad ${opacity}`);
  await ctx.close();
}

// ─── 7b. Arquitectura V7 multipágina ────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1000);
  check("Arquitectura: Inicio usa previews, no páginas completas",
    (await p.locator(".v7-featured-preview,.v7-services-preview,.v7-about-preview,.v7-home-cta").count()) === 4 &&
    (await p.locator(".v7-projects,.v7-services,.v7-about,.v7-faq,.v7-contact").count()) === 0);

  for (const [path, selector] of [
    ["/es/proyectos", ".v7-projects"],
    ["/es/servicios", ".v7-services"],
    ["/es/nosotros", ".v7-about"],
    ["/es/contacto", ".v7-contact-page"],
    ["/es/proceso", ".v7-process-timeline"],
  ]) {
    await p.goto(URL + path, { waitUntil: "domcontentloaded" });
    check(`Arquitectura: ${path} contiene su experiencia V7`, (await p.locator(selector).count()) === 1);
  }
  await p.goto(URL + "/es/contacto", { waitUntil: "domcontentloaded" });
  check("Arquitectura: Contacto no duplica FAQ", (await p.locator(".v7-faq").count()) === 0);
  for (const path of ["/es/preguntas", "/en/faq"]) {
    await p.goto(URL + path, { waitUntil: "domcontentloaded" });
    check(`Arquitectura: ${path} conserva FAQ independiente y header sólido`,
      (await p.locator(".v7-faq").count()) === 1 &&
      (await p.locator(".v7-faq details").count()) === 8 &&
      (await p.locator("header.is-solid").count()) === 1 &&
      (await p.locator("h1").count()) === 1);
  }
  await ctx.close();
}

// ─── 8. Servicios: enlaces únicos y detalles ────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);

  const previewHrefs = await p.locator(".v7-services-preview a[href*='/servicios/']").evaluateAll((els) =>
    els.map((e) => e.getAttribute("href"))
  );
  check("Inicio: muestra una selección breve de 4 servicios",
    previewHrefs.length === 4 && new Set(previewHrefs).size === 4,
    `${previewHrefs.length} enlaces, ${new Set(previewHrefs).size} únicos`);

  await p.goto(URL + "/es/servicios", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  const hrefs = [];
  const choices = p.locator(".v7-service-list button");
  for (let index = 0; index < await choices.count(); index++) {
    await choices.nth(index).click();
    hrefs.push(await p.locator(".v7-service-copy a[href*='/servicios/']").getAttribute("href"));
    check(`Servicios: selector ${index + 1} activa la ficha accesible`, await choices.nth(index).getAttribute("aria-pressed") === "true");
  }
  const unique = new Set(hrefs);
  check("Servicios: la página dedicada conserva los 5 servicios", hrefs.length >= 5 && unique.size === 5,
    `${hrefs.length} enlaces, ${unique.size} únicos`);

  const SERVICE_PATHS = [
    ["/es/servicios/construccion-personalizada", "/en/services/custom-construction"],
    ["/es/servicios/remodelaciones", "/en/services/remodeling"],
    ["/es/servicios/cocinas-y-banos", "/en/services/kitchens-and-bathrooms"],
    ["/es/servicios/espacios-exteriores", "/en/services/outdoor-spaces"],
    ["/es/servicios/reparaciones-y-mejoras", "/en/services/repairs-and-improvements"],
  ];

  let all200 = true;
  for (const pair of SERVICE_PATHS) {
    for (const path of pair) {
      const r = await p.request.get(URL + path);
      if (r.status() !== 200) all200 = false;
    }
  }
  check("Servicios: los 5 detalles responden 200 en ambos idiomas", all200);

  // Un slug del idioma equivocado no debe servir contenido duplicado.
  const wrong = await p.request.get(URL + "/en/services/cocinas-y-banos");
  check("Servicios: slug del idioma equivocado devuelve 404", wrong.status() === 404, String(wrong.status()));

  // Metadata propia por servicio.
  const html = await (await p.request.get(URL + "/es/servicios/cocinas-y-banos")).text();
  check("Servicios: canonical propio del detalle", html.includes("/es/servicios/cocinas-y-banos"));
  const lower = html.toLowerCase();
  check("Servicios: alternates recíprocos por entidad",
    lower.includes("/en/services/kitchens-and-bathrooms"));

  await ctx.close();
}

// ─── 9. Preselección de servicio en la cotización ───────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es/cotizacion?servicio=kitchens-bathrooms", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1600);
  check("Cotización: preselecciona el servicio del enlace",
    (await p.locator("#service").inputValue()) === "kitchens-bathrooms");

  // Un ID inventado se ignora en vez de preseleccionar basura.
  // Se limpia el borrador antes: si no, la elección guardada del caso
  // anterior gana (que es el comportamiento correcto, pero no lo que se
  // está probando aquí).
  await p.evaluate(() => {
    try { window.sessionStorage.clear(); } catch { /* sin storage */ }
  });
  await p.goto(URL + "/es/cotizacion?servicio=no-existe", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1600);
  check("Cotización: ignora un servicio inexistente",
    (await p.locator("#service").inputValue()) === "");

  await ctx.close();
}

// ─── 10. El idioma preserva el contexto ─────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  /*
   * React no expone ningún evento de "ya hidraté": `readyState === complete`
   * ocurre ANTES de que el onClick esté asociado, así que un clic temprano
   * no hace nada. En vez de subir un sleep a ciegas, se reintenta el clic
   * hasta que surta efecto. Es determinista y se detiene solo.
   */
  const switchAndGet = async (from, to, attempts = 5) => {
    await p.goto(URL + from, { waitUntil: "domcontentloaded" });
    // `URL` está sombreado por la constante de arriba: se usa el global.
    const startPath = new globalThis.URL(URL + from).pathname;
    const trigger = p.locator(".v7-language-trigger");
    await trigger.waitFor({ state: "visible" });

    for (let i = 0; i < attempts; i++) {
      if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click().catch(() => {});
      }
      const btn = p.locator('[role="menuitemradio"]', { hasText: to });
      try {
        await btn.waitFor({ state: "visible", timeout: 1500 });
        await btn.click();
        await p.waitForURL((u) => u.pathname !== startPath, { timeout: 1500 });
        break;
      } catch {
        /* aún no había hidratado: se reintenta */
      }
    }
    return p.url().replace(URL, "");
  };

  let got = await switchAndGet("/es/proyectos/renovacion-de-cocina", "EN");
  check("Idioma: proyecto dinámico traduce el slug", got === "/en/projects/kitchen-renovation", got);

  got = await switchAndGet("/en/projects/kitchen-renovation", "ES");
  check("Idioma: vuelta conserva la entidad", got === "/es/proyectos/renovacion-de-cocina", got);

  got = await switchAndGet("/es/servicios/cocinas-y-banos", "EN");
  check("Idioma: servicio dinámico traduce el slug", got === "/en/services/kitchens-and-bathrooms", got);

  got = await switchAndGet("/es/proyectos?categoria=kitchens", "EN");
  check("Idioma: conserva el filtro de la query", got === "/en/projects?categoria=kitchens", got);

  await ctx.close();
}

// ─── 11. 404 con marca en cualquier ruta no reconocida ──────────────────
{
  /*
   * `app/[locale]/not-found.tsx` existía y estaba bien hecho, pero solo se
   * pintaba cuando una ruta EXISTENTE llamaba a `notFound()`. Una dirección
   * que no coincidía con ninguna ruta caía en la pantalla por defecto de
   * Next: 7.200 bytes, fondo negro, en inglés, sin cabecera ni marca. El
   * comodín de `app/[locale]/[...rest]` es lo que cierra ese hueco.
   */
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  const branded = async (path, expect) => {
    const r = await p.request.get(URL + path);
    const html = await r.text();
    check(
      `404: ${path} → 404 con marca en ${expect.lang}`,
      r.status() === 404 && /Andrade Parra Corporation/i.test(html) && expect.needle.test(html),
      `${r.status()} · ${html.length} bytes`
    );
  };

  const ES = { lang: "español", needle: /Página no encontrada/ };
  const EN = { lang: "inglés", needle: /Page not found/ };

  await branded("/es/ruta-inventada", ES);
  await branded("/en/made-up-route", EN);
  // Sin prefijo: `proxy.ts` antepone el idioma detectado y el comodín hace el
  // resto. Una sola redirección, sin bucle.
  {
    const r = await p.request.get(URL + "/ruta-sin-prefijo", { maxRedirects: 0 });
    check("404: /ruta-sin-prefijo redirige UNA vez al idioma por defecto",
      r.status() === 307 && (r.headers()["location"] ?? "").startsWith("/en/"),
      `${r.status()} → ${r.headers()["location"]}`);
  }
  await branded("/ruta-sin-prefijo", EN);

  /*
   * Los 404 deliberados siguen intactos. `/privacidad` y `/terminos` devuelven
   * 404 a propósito mientras el texto legal siga sin revisar por el cliente:
   * un texto legal a medias es peor que ninguno. Ver
   * app/[locale]/privacy/page.tsx.
   */
  await branded("/es/privacidad", ES);
  await branded("/es/terminos", ES);
  await branded("/en/privacy", EN);
  await branded("/en/terms", EN);

  await ctx.close();
}

// ─── 12. Tarjeta social ─────────────────────────────────────────────────
{
  /*
   * El sitio declaraba `summary_large_image` sin `og:image`: prometía tarjeta
   * con imagen grande y salía vacía. Importa porque TODO el embudo pasa por
   * WhatsApp y la portada es la URL que se comparte.
   */
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  for (const path of ["/es", "/en", "/es/cotizacion", "/en/quote"]) {
    const html = await (await p.request.get(URL + path)).text();
    const og = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
    check(`og:image en ${path}, con URL absoluta`,
      Boolean(og) && /^https?:\/\//.test(og ?? ""), og ?? "ausente");
  }

  const img = await p.request.get(URL + "/og/home.jpg");
  check("og:image: el archivo existe y se sirve", img.status() === 200,
    `${img.status()} · ${img.headers()["content-type"]}`);

  await ctx.close();
}

// ─── 13. Visor de imagen ampliada ───────────────────────────────────────
{
  /*
   * El propietario juzga el trabajo por el remate del azulejo y en la
   * cuadrícula no podía acercarse. El visor reutiliza el patrón de foco de
   * `MobileMenu.tsx`: se abre con teclado, atrapa el foco, cierra con Escape
   * y lo devuelve al origen.
   */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL + "/es/proyectos/renovacion-de-cocina", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  const trigger = p.locator('button[aria-label^="Ver la fotografía ampliada"]').first();
  check("Visor: la foto es un disparador con nombre accesible",
    (await trigger.count()) === 1);

  const overflowBefore = await p.evaluate(() => getComputedStyle(document.body).overflow);

  // Se abre con teclado: es un <button> nativo, así que Enter basta.
  await trigger.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(500);

  const dialog = p.locator('[role="dialog"][aria-modal="true"]');
  check("Visor: abre un diálogo modal", (await dialog.count()) === 1);
  check("Visor: el foco entra en el visor",
    await p.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null));
  check("Visor: bloquea el scroll del fondo",
    (await p.evaluate(() => document.body.style.overflow)) === "hidden");
  check("Visor: el objetivo de cierre llega a 44 px",
    await (async () => {
      const box = await p.locator('[role="dialog"] button[aria-label]').last().boundingBox();
      return Boolean(box) && box.width >= 44 && box.height >= 44;
    })());
  check("Visor: no amplía la foto por encima de su resolución real",
    await (async () => {
      const box = await p.locator('[role="dialog"] img').first().boundingBox();
      return Boolean(box) && box.width <= 960 + 1;
    })(),
    "las fotos actuales topan en 960 px de ancho");

  // Trampa de foco: tabular en círculo no debe salir del diálogo.
  for (let i = 0; i < 6; i++) await p.keyboard.press("Tab");
  check("Visor: el foco queda atrapado dentro",
    await p.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null));

  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  check("Visor: Escape cierra", (await dialog.count()) === 0);
  check("Visor: el foco vuelve a la imagen de origen",
    await p.evaluate(() =>
      document.activeElement?.getAttribute("aria-label")?.startsWith("Ver la fotografía ampliada") === true
    ));
  check("Visor: el scroll del fondo se restaura",
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) === overflowBefore);

  // En la cuadrícula la lupa va aparte del enlace: pulsar la tarjeta navega.
  await p.goto(URL + "/es/proyectos", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  check("Visor: la cuadrícula ofrece la lupa sin robar la navegación",
    (await p.locator('button[aria-label^="Ver la fotografía ampliada"]').count()) > 0);
  await p.locator("article a").first().click();
  await p.waitForTimeout(900);
  check("Visor: pulsar la tarjeta sigue abriendo el proyecto",
    /\/es\/proyectos\/.+/.test(p.url()), p.url());

  await ctx.close();
}

// ─── 14. Ninguna vista publica dirección postal ─────────────────────────
{
  /*
   * Mientras el cliente no confirme por escrito que hay local de cara al
   * público, el sitio afirma ZONA DE SERVICIO y no dirección: `address` en
   * JSON-LD le dice a Google "aquí se puede venir", y sobre un domicilio
   * particular eso dirige desconocidos a la casa de alguien.
   * Ver content/company.ts.
   */
  const ctx = await browser.newContext();
  const p = await ctx.newPage();

  for (const path of ["/es", "/es/contacto", "/en/contact"]) {
    const html = await (await p.request.get(URL + path)).text();
    check(`Zona de servicio: ${path} no publica calle ni código postal`,
      !/Burning Hills|77075|PostalAddress/.test(html));
  }

  const home = await (await p.request.get(URL + "/es")).text();
  check("Zona de servicio: el JSON-LD declara areaServed",
    /"areaServed"/.test(home) && /"name":"Houston"/.test(home));

  for (const [path, needle] of [
    ["/es/contacto", "Houston y alrededores, TX"],
    ["/en/contact", "Houston and surrounding areas, TX"],
  ]) {
    const html = await (await p.request.get(URL + path)).text();
    check(`Zona de servicio coherente en ${path}`, html.includes(needle), needle);
  }

  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas`);
if (failed.length) {
  console.log("Fallos:");
  failed.forEach((f) => console.log("  -", f.name));
  process.exit(1);
}
