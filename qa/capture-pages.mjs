/**
 * Captura multipágina para la revisión visual y la matriz de QA.
 *
 * Uso: node qa/capture-pages.mjs <etiqueta> [baseUrl]
 * Salida: qa/shots/<etiqueta>/ + informe.json
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const label = process.argv[2] ?? "sin-etiqueta";
const baseUrl = process.argv[3] ?? "http://127.0.0.1:4318";
const outDir = path.join("qa", "shots", label);

const PAGES = [
  { name: "home", es: "/es", en: "/en" },
  { name: "proyectos", es: "/es/proyectos", en: "/en/projects" },
  { name: "cotizacion", es: "/es/cotizacion", en: "/en/quote" },
  { name: "servicios", es: "/es/servicios", en: "/en/services" },
  { name: "nosotros", es: "/es/nosotros", en: "/en/about" },
  { name: "contacto", es: "/es/contacto", en: "/en/contact" },
  { name: "proceso", es: "/es/proceso", en: "/en/process" },
  { name: "preguntas", es: "/es/preguntas", en: "/en/faq" },
  {
    name: "detalle-proyecto",
    es: "/es/proyectos/renovacion-de-cocina",
    en: "/en/projects/kitchen-renovation",
  },
  { name: "servicio-detalle", es: "/es/servicios/cocinas-y-banos", en: "/en/services/kitchens-and-bathrooms" },
  { name: "404", es: "/es/no-existe", en: "/en/does-not-exist" },
];

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "360x800", width: 360, height: 800 },
  { name: "375x812", width: 375, height: 812 },
  { name: "390x844", width: 390, height: 844 },
  { name: "393x852", width: 393, height: 852 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
  { name: "568x320-landscape", width: 568, height: 320 },
  { name: "812x375-landscape", width: 812, height: 375 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const report = { label, baseUrl, capturedAt: new Date().toISOString(), results: [] };

  // Un solo contexto y una sola pestaña reutilizada: crear 64 contextos
  // seguidos agota los buffers de red de Windows (ERR_NO_BUFFER_SPACE).
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  let consoleErrors = [];
  let pageErrors = [];
  p.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  p.on("pageerror", (e) => pageErrors.push(String(e)));

  const selectedPages = process.env.QA_PAGES?.split(",");
  const selectedViewports = process.env.QA_VIEWPORTS?.split(",");
  for (const page of PAGES.filter((entry) => !selectedPages || selectedPages.includes(entry.name))) {
    for (const locale of ["es", "en"]) {
      for (const vp of VIEWPORTS.filter((entry) => !selectedViewports || selectedViewports.includes(entry.name))) {
        consoleErrors = [];
        pageErrors = [];
        // La página 404 devuelve HTTP 404 por diseño; el navegador lo registra
        // como error de consola. Contarlo sería un falso positivo.
        const expects404 = page.name === "404";
        await p.setViewportSize({ width: vp.width, height: vp.height });

        const url = baseUrl + page[locale];
        const response = await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await p.waitForTimeout(900);

        const diag = await p.evaluate(() => {
          const doc = document.documentElement;
          const overflow = doc.scrollWidth - doc.clientWidth;
          const sx = window.scrollX;

          const offenders = [];
          if (overflow > 0) {
            for (const el of document.querySelectorAll("body *")) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;
              if (getComputedStyle(el).position === "fixed") continue;
              let inScroller = false;
              for (let a = el.parentElement; a; a = a.parentElement) {
                const ox = getComputedStyle(a).overflowX;
                if (ox === "auto" || ox === "scroll" || ox === "hidden") { inScroller = true; break; }
              }
              if (inScroller) continue;
              if (r.right + sx > doc.clientWidth + 1) {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  cls: (el.getAttribute("class") ?? "").slice(0, 90),
                  w: Math.round(r.width),
                });
              }
              if (offenders.length >= 6) break;
            }
          }

          const smallTargets = [];
          for (const el of document.querySelectorAll("a,button,input,select,textarea,[role='button']")) {
            let r = el.getBoundingClientRect();
            if (r.width <= 1 || r.height <= 1) continue;
            if (el.closest("[aria-hidden='true']")) continue;
            // Native labels and pointer-enabled pseudo-elements are real hit
            // areas. Measure them, including clipping, not only the glyph box.
            for (const label of el.labels ?? []) {
              const bounds = label.getBoundingClientRect();
              if (bounds.width >= 44 && bounds.height >= 44) r = bounds;
            }
            let { left, right, top, bottom } = r;
            for (const pseudo of ["::before", "::after"]) {
              const style = getComputedStyle(el, pseudo);
              if (style.content === "none" || style.position !== "absolute" || style.pointerEvents === "none") continue;
              const x = Number.parseFloat(style.left), y = Number.parseFloat(style.top);
              const width = Number.parseFloat(style.width), height = Number.parseFloat(style.height);
              if (![x, y, width, height].every(Number.isFinite)) continue;
              left = Math.min(left, r.left + x); right = Math.max(right, r.left + x + width);
              top = Math.min(top, r.top + y); bottom = Math.max(bottom, r.top + y + height);
            }
            const fullWidth = right - left;
            let inHorizontalRail = false;
            for (let parent = el.parentElement; parent; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              const bounds = parent.getBoundingClientRect();
              if (["auto", "scroll"].includes(style.overflowX) && parent.scrollWidth > parent.clientWidth) inHorizontalRail = true;
              if (style.overflowX !== "visible") { left = Math.max(left, bounds.left); right = Math.min(right, bounds.right); }
              if (style.overflowY !== "visible") { top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom); }
            }
            // Off-screen items in rails are checked when brought into view.
            if (right <= left || bottom <= top) continue;
            // The deliberately visible sliver of the next slide is not the
            // full target: swipe/focus brings its complete width into view.
            r = { width: inHorizontalRail ? fullWidth : right - left, height: bottom - top };
            if (r.width < 44 || r.height < 44) {
              smallTargets.push({
                tag: el.tagName.toLowerCase(),
                text: (el.textContent ?? "").trim().slice(0, 30),
                w: Math.round(r.width),
                h: Math.round(r.height),
              });
            }
          }

          return {
            lang: doc.lang,
            horizontalOverflowPx: overflow,
            offenders,
            smallTargets,
            h1Count: document.querySelectorAll("h1").length,
            // alt="" is the correct accessible treatment for decorative
            // imagery; only an actually missing attribute is a failure.
            imagesWithoutAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
            documentHeight: doc.scrollHeight,
          };
        });

        const capture = process.env.QA_CAPTURE !== "review" ||
          (locale === "es" && ["home", "proyectos", "servicios", "nosotros", "preguntas"].includes(page.name) && ["390x844", "1440x900"].includes(vp.name));
        const file = capture ? path.join(outDir, `${locale}-${page.name}-${vp.name}.png`) : null;
        if (file) await p.screenshot({ path: file, fullPage: true });

        const filteredConsole = expects404
          ? consoleErrors.filter((m) => !/404 \(Not Found\)/.test(m))
          : consoleErrors;

        report.results.push({
          page: page.name, locale, viewport: vp.name, url, screenshot: file,
          httpStatus: response.status(), expectedStatus: expects404 ? 404 : 200,
          consoleErrors: filteredConsole, pageErrors: [...pageErrors], ...diag,
        });
      }
    }
  }

  await ctx.close();
  await browser.close();
  await writeFile(path.join(outDir, "informe.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(`\n=== QA "${label}" — ${baseUrl} ===`);
  let issues = 0;
  for (const r of report.results) {
    const flags = [];
    if (r.httpStatus !== r.expectedStatus) flags.push(`HTTP:${r.httpStatus}`);
    if (r.horizontalOverflowPx > 0) flags.push(`SCROLL-H:${r.horizontalOverflowPx}px`);
    if (r.consoleErrors.length) flags.push(`CONSOLA:${r.consoleErrors.length}`);
    if (r.pageErrors.length) flags.push(`JS:${r.pageErrors.length}`);
    if (r.smallTargets.length) flags.push(`TAP<44:${r.smallTargets.length}`);
    if (r.h1Count !== 1) flags.push(`H1=${r.h1Count}`);
    if (r.imagesWithoutAlt > 0) flags.push(`SIN-ALT:${r.imagesWithoutAlt}`);
    if (flags.length) {
      issues++;
      console.log(`${r.locale} ${r.page.padEnd(11)} ${r.viewport.padEnd(10)} ${flags.join(" | ")}`);
    }
  }
  console.log(
    issues === 0
      ? `\nTODO EN VERDE — ${report.results.length}/${report.results.length} escenarios sin incidencias`
      : `\n${report.results.length - issues}/${report.results.length} escenarios en verde`
  );
  console.log(`Informe: ${path.join(outDir, "informe.json")}`);
  if (report.results.some((r) => r.httpStatus !== r.expectedStatus || r.horizontalOverflowPx > 0 || r.pageErrors.length || r.consoleErrors.length || r.h1Count !== 1 || r.imagesWithoutAlt || r.smallTargets.length)) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
