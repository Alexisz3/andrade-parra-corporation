import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4318";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const width of [360, 375, 390, 430, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 1000 ? 844 : 1080 });
    await page.goto(base + "/en");
    for (const selector of [".v7-hero-project-links a:visible", ".v7-desktop-nav a:visible"]) {
      for (const link of await page.locator(selector).all()) {
        await link.scrollIntoViewIfNeeded();
        const hit = await link.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element, element.closest("nav") ? "::before" : "::after");
          const left = rect.left + parseFloat(style.left), top = rect.top + parseFloat(style.top);
          const w = parseFloat(style.width), h = parseFloat(style.height);
          const points = [[left + 1, top + h / 2], [left + w - 1, top + h / 2], [left + w / 2, top + 1], [left + w / 2, top + h - 1]];
          return { width: w, height: h, reachable: points.every(([x, y]) => element.contains(document.elementFromPoint(x, y))) };
        });
        assert(hit.width >= 44 && hit.height >= 44 && hit.reachable, `${width}px: ${await link.innerText()} ${JSON.stringify(hit)}`);
      }
    }
    await page.goto(base + "/en/quote");
    const consent = page.locator(".v7-consent");
    await consent.scrollIntoViewIfNeeded();
    const bounds = await consent.boundingBox();
    assert(bounds.height >= 44 && bounds.width >= 44);
    const before = await page.locator("#consent").isChecked();
    await consent.click({ position: { x: bounds.width - 10, y: bounds.height / 2 } });
    assert.notEqual(await page.locator("#consent").isChecked(), before, "The full consent label toggles the checkbox");
    console.log(`OK ${width}px: real hit testing confirms 44px targets without enlarging the Hero`);
  }
} finally {
  await browser.close();
}
