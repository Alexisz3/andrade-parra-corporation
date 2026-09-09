/**
 * Accesibilidad automatizada con axe-core.
 * Uso: node qa/axe.mjs [baseUrl]
 *
 * Falla (exit 1) ante violaciones de impacto `critical` o `serious`.
 * Las de impacto menor se listan como aviso, no bloquean.
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const URL = process.argv[2] ?? "http://127.0.0.1:4318";

const TARGETS = [
  { name: "home es", path: "/es" },
  { name: "home en", path: "/en" },
  { name: "proyectos es", path: "/es/proyectos" },
  { name: "proyectos filtrado", path: "/es/proyectos?cat=kitchens" },
  { name: "detalle proyecto", path: "/es/proyectos/renovacion-de-cocina" },
  { name: "cotizacion es", path: "/es/cotizacion" },
  { name: "cotizacion en", path: "/en/quote" },
  { name: "servicios es", path: "/es/servicios" },
  { name: "detalle servicio", path: "/es/servicios/cocinas-y-banos" },
  { name: "nosotros es", path: "/es/nosotros" },
  { name: "contacto es", path: "/es/contacto" },
  { name: "proceso es", path: "/es/proceso" },
];

const VIEWPORTS = [
  { name: "movil", width: 390, height: 844 },
  { name: "escritorio", width: 1440, height: 900 },
];

const browser = await chromium.launch();
let blocking = 0;
let minor = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  for (const target of TARGETS) {
    await page.goto(URL + target.path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    const others = results.violations.filter(
      (v) => v.impact !== "critical" && v.impact !== "serious"
    );

    blocking += serious.length;
    minor += others.length;

    const label = `${vp.name.padEnd(11)} ${target.name.padEnd(20)}`;
    if (serious.length === 0 && others.length === 0) {
      console.log(`OK    ${label} sin violaciones`);
    } else {
      console.log(`${serious.length ? "FALLA" : "AVISO"} ${label}`);
      for (const v of [...serious, ...others]) {
        console.log(`        [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodo/s)`);
      }
    }
  }

  // Estado interactivo: menú móvil abierto.
  if (vp.name === "movil") {
    await page.goto(URL + "/es", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.locator('header button[aria-controls="menu-movil"]').click();
    await page.waitForTimeout(600);
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    blocking += serious.length;
    console.log(
      `${serious.length ? "FALLA" : "OK   "} movil       menu abierto         ${
        serious.length ? "" : "sin violaciones"
      }`
    );
    serious.forEach((v) => console.log(`        [${v.impact}] ${v.id}: ${v.help}`));
  }

  await ctx.close();
}

await browser.close();

console.log(`\nViolaciones bloqueantes (critical/serious): ${blocking}`);
console.log(`Violaciones menores (moderate/minor): ${minor}`);
if (blocking > 0) process.exit(1);
