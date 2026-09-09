/** Regression checks for the manual featured rail and mobile service selection. */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4318";
const browser = await chromium.launch();
let scenarios = 0;
try {
  for (const width of [360, 375, 390, 430, 768, 1366, 1440, 1920]) {
    for (const reducedMotion of ["reduce", "no-preference"]) {
      const context = await browser.newContext({ viewport: { width, height: width < 1000 ? 844 : 900 }, reducedMotion, hasTouch: width <= 768 });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/es");
      const rail = page.locator(".v7-featured-track");
      await rail.scrollIntoViewIfNeeded();
      const count = await rail.locator("li").count();
      assert(count > 0 && count <= 6, "Featured items come from a bounded catalog selection");
      const layout = await rail.evaluate((element) => ({
        overflow: element.scrollWidth > element.clientWidth,
        snap: getComputedStyle(element).scrollSnapType,
        visible: element.clientWidth / element.firstElementChild.getBoundingClientRect().width,
      }));
      assert(layout.overflow && layout.snap.includes("mandatory"));
      assert(width <= 430 ? layout.visible >= 1.1 && layout.visible <= 1.2 : width <= 820 ? layout.visible >= 1.9 && layout.visible <= 2.2 : layout.visible >= 2.5 && layout.visible <= 3);
      await page.locator(".v7-featured-navigation button").last().click();
      await page.waitForFunction(() => document.querySelector(".v7-featured-track").scrollLeft > 5);
      await rail.focus();
      await page.keyboard.press("End");
      await page.waitForFunction(() => document.querySelector(".v7-featured-navigation button:last-child").disabled);
      await page.keyboard.press("Home");
      await page.waitForFunction(() => document.querySelector(".v7-featured-navigation button").disabled);
      await page.keyboard.press("Tab");
      assert(await page.locator(".v7-featured-card").first().evaluate((element) => element === document.activeElement));
      const before = await rail.evaluate((element) => element.scrollLeft);
      await page.waitForTimeout(500);
      assert.equal(await rail.evaluate((element) => element.scrollLeft), before, "Manual rail does not autoplay");

      await page.goto(base + "/es/servicios");
      const list = page.locator(".v7-service-list");
      await list.scrollIntoViewIfNeeded();
      const choices = list.locator("button");
      if (width <= 820) {
        // Scroll without click/focus: the centered card must select itself.
        for (const index of [1, 3, 4, 0]) {
          await list.evaluate((element, target) => {
            const card = element.children[target].getBoundingClientRect();
            const bounds = element.getBoundingClientRect();
            element.scrollTo({ left: element.scrollLeft + card.left - bounds.left - (bounds.width - card.width) / 2, behavior: "instant" });
          }, index);
          await page.waitForFunction((index) => document.querySelectorAll(".v7-service-list button")[index].getAttribute("aria-pressed") === "true", index);
          const selected = await choices.nth(index).locator("strong").textContent();
          assert.equal(await page.locator(".v7-service-copy .v7-meta").textContent(), selected);
        }
      }
      await choices.nth(2).click();
      await page.waitForFunction(() => document.querySelectorAll(".v7-service-list button")[2].getAttribute("aria-pressed") === "true");
      await choices.nth(2).focus();
      await page.keyboard.press("Tab");
      assert.equal(await choices.nth(3).getAttribute("aria-pressed"), "true");
      await page.waitForTimeout(400);
      assert.equal(await choices.nth(3).getAttribute("aria-pressed"), "true", "Selection settles without flicker");
      if (width <= 820) {
        // Reconnect/disconnect the observer across the responsive breakpoint.
        await page.setViewportSize({ width: 1440, height: 900 });
        await choices.nth(1).click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(400);
        assert.equal(await choices.nth(1).getAttribute("aria-pressed"), "true");
      }
      assert.deepEqual(errors, []);
      console.log(`OK ${width}px / ${reducedMotion}: rail, snap, keyboard, service selection`);
      scenarios++;
      await context.close();
    }
  }
  const page = await browser.newPage();
  for (const file of ["instalacion-ventanas-01.jpeg", "exterior-lujo-02.jpeg", "bano-03.jpeg"]) {
    const response = await page.request.get(`${base}/images/proyectos/${file}`);
    assert.equal(response.status(), 404, `${file} must not be public`);
  }
  for (const route of ["/es/proyectos/instalacion-de-ventanas", "/en/projects/window-installation"]) {
    assert.equal((await page.request.get(base + route)).status(), 404);
  }
  console.log(`PASS: ${scenarios} interaction scenarios; removed assets and routes return 404.`);
} finally {
  await browser.close();
}
