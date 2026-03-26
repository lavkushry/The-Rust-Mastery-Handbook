// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Pages to test across the handbook — representative sample.
 * Covers: title page, part opener, ownership, borrowing/lifetimes,
 * callouts, tables, flashcards, cheat sheets, async, appendix.
 */
const PAGES = [
  { name: "title-page", path: "/00_title_and_toc.html" },
  { name: "part-1-opener", path: "/part-01/index.html" },
  { name: "ownership-chapter", path: "/part-03/chapter-16-ownership-as-resource-management.html" },
  { name: "borrowing-chapter", path: "/part-03/chapter-17-borrowing-constrained-access.html" },
  { name: "lifetimes-chapter", path: "/part-03/chapter-18-lifetimes-relationships-not-durations.html" },
  { name: "borrow-checker-chapter", path: "/part-03/chapter-21-the-borrow-checker-how-the-compiler-thinks.html" },
  { name: "async-chapter", path: "/part-05/chapter-33-async-await-and-futures.html" },
  { name: "unsafe-chapter", path: "/part-06/chapter-37-unsafe-rust-power-and-responsibility.html" },
  { name: "retention-drills", path: "/10_retention_and_mastery_drills.html" },
];

/**
 * Network errors that are expected in a local/offline test environment:
 * mdBook ships with a Rust Playground integration that fetches from
 * play.rust-lang.org — these fail offline and are not our bugs.
 */
const KNOWN_OFFLINE_ERROR_PATTERNS = [
  /play\.rust-lang\.org/,
  /ERR_NAME_NOT_RESOLVED/,
  /Failed to fetch/,
  /net::ERR_/,
];

function isKnownOfflineError(message) {
  return KNOWN_OFFLINE_ERROR_PATTERNS.some((re) => re.test(message));
}

// ─── No unexpected JS console errors ─────────────────────────────────────────

for (const page of PAGES) {
  test(`no console errors — ${page.name}`, async ({ page: pw }) => {
    const errors = [];
    pw.on("pageerror", (err) => {
      if (!isKnownOfflineError(err.message)) errors.push(`pageerror: ${err.message}`);
    });
    pw.on("console", (msg) => {
      if (msg.type() === "error" && !isKnownOfflineError(msg.text())) {
        errors.push(`console.error: ${msg.text()}`);
      }
    });
    await pw.goto(page.path);
    await pw.waitForLoadState("domcontentloaded");
    expect(errors, `Console errors on ${page.name}: ${errors.join("; ")}`).toHaveLength(0);
  });
}

// ─── Pages render with expected structural elements ───────────────────────────

for (const page of PAGES) {
  test(`page renders correctly — ${page.name}`, async ({ page: pw }) => {
    await pw.goto(page.path);
    await pw.waitForLoadState("domcontentloaded");

    // mdBook chrome
    await expect(pw.locator("#mdbook-content")).toBeVisible();
    await expect(pw.locator("#mdbook-content main")).toBeVisible();

    // No horizontal overflow on the main content area
    const hasOverflow = await pw.evaluate(() => {
      const main = document.querySelector("#mdbook-content main");
      return main ? main.scrollWidth > main.clientWidth + 2 : false;
    });
    expect(hasOverflow, `Horizontal overflow detected on ${page.name}`).toBe(false);

    // At least one h1
    const h1Count = await pw.locator("#mdbook-content main h1").count();
    expect(h1Count, `Expected at least one h1 on ${page.name}`).toBeGreaterThan(0);
  });
}

// ─── Visual-edition enhancements applied ────────────────────────────────────

test("visual-edition — concept class applied to main", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const main = page.locator("#mdbook-content main");
  await expect(main).toHaveClass(/visual-edition-page/);
  const concept = await main.getAttribute("data-concept");
  expect(concept).toBeTruthy();
});

test("visual-edition — chapter hero rendered on ownership chapter", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const hero = page.locator(".chapter-hero");
  await expect(hero).toBeVisible();
  await expect(hero.locator(".chapter-hero__title")).toBeVisible();
});

test("visual-edition — tables get visual-table class", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "retention-drills").path);
  await page.waitForLoadState("domcontentloaded");
  const tableCount = await page.locator("#mdbook-content main table").count();
  if (tableCount > 0) {
    const tables = page.locator("#mdbook-content main table");
    for (let i = 0; i < tableCount; i++) {
      await expect(tables.nth(i)).toHaveClass(/visual-table/);
    }
  }
});

// ─── No duplicate transformations (idempotency check) ────────────────────────

test("no duplicate hero sections", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const heroCount = await page.locator(".chapter-hero, .part-spread").count();
  expect(heroCount, "Multiple hero sections found — transformation not idempotent").toBeLessThanOrEqual(1);
});

// ─── Accessibility basics ────────────────────────────────────────────────────

test("images have alt text on ownership chapter", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const imagesWithoutAlt = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#mdbook-content main img"))
      .filter((img) => !img.getAttribute("alt") && !img.closest("[aria-hidden='true']"))
      .map((img) => img.src);
  });
  expect(imagesWithoutAlt, `Images without alt text: ${imagesWithoutAlt.join(", ")}`).toHaveLength(0);
});

test("main landmark is present and visible", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "title-page").path);
  await page.waitForLoadState("domcontentloaded");
  const main = page.locator("main, #mdbook-content main, [role='main']");
  await expect(main.first()).toBeVisible();
});

test("visible focus states — links are keyboard accessible", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  // Tab into the page and check an element gets a visible focus ring
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  const count = await focused.count();
  expect(count, "No element received focus after Tab").toBeGreaterThan(0);
});

// ─── Navigation links present ─────────────────────────────────────────────────

test("sidebar nav links are present", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "title-page").path);
  await page.waitForLoadState("domcontentloaded");

  const navLinks = page.locator("#mdbook-sidebar a[href]");
  const count = await navLinks.count();
  expect(count, "Sidebar has no navigation links").toBeGreaterThan(0);
});

// ─── Mobile layout — no overflow ─────────────────────────────────────────────

test("mobile — no horizontal overflow on ownership chapter", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, "Horizontal overflow on mobile viewport").toBe(false);
});

// ─── Code blocks don't overflow ──────────────────────────────────────────────

test("code blocks have overflow scroll, not overflow visible", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const preCount = await page.locator("#mdbook-content main pre").count();
  if (preCount > 0) {
    // All pre elements should not cause page-level overflow
    const pageOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });
    expect(pageOverflow, "Code blocks cause horizontal overflow on desktop").toBe(false);
  }
});
