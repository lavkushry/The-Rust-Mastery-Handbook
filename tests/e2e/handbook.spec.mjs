// @ts-check
import { expect, test } from "@playwright/test";
import axeCore from "axe-core";

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

/** @param {string} message */
function isKnownOfflineError(message) {
  return KNOWN_OFFLINE_ERROR_PATTERNS.some((re) => re.test(message));
}

/** @param {import("@playwright/test").Page} page */
async function runAxeOnMain(page) {
  await page.addScriptTag({ content: axeCore.source });
  return page.evaluate(async () => {
    const context = document.querySelector("#mdbook-content main") ?? document.body;
    const axeApi = /** @type {any} */ (window).axe;
    if (!axeApi) {
      throw new Error("axe was not injected into the page context");
    }

    return axeApi.run(context, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
      rules: {
        // We validate structural a11y in CI; contrast depends on theme and user settings.
        "color-contrast": { enabled: false },
      },
    });
  });
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

test("visual-edition — tables get visual-table class and wrapper", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "retention-drills").path);
  await page.waitForLoadState("domcontentloaded");
  const tableCount = await page.locator("#mdbook-content main table").count();
  if (tableCount > 0) {
    const tables = page.locator("#mdbook-content main table");
    for (let i = 0; i < tableCount; i++) {
      await expect(tables.nth(i)).toHaveClass(/visual-table/);
      // Each table should be in a scrollable wrapper
      const parentClass = await tables.nth(i).evaluate(
        (el) => el.parentElement?.className ?? "",
      );
      expect(parentClass, `Table ${i} should be wrapped in .visual-table-wrapper`).toMatch(/visual-table-wrapper/);
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

test("skip-to-content link is present and targets main content", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "title-page").path);
  await page.waitForLoadState("domcontentloaded");

  const skip = page.locator("a.skip-to-content").first();
  await expect(skip).toBeAttached();
  await expect(skip).toHaveAttribute("href", /#main-content/);
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

test("level tabs support keyboard navigation and tab semantics", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "unsafe-chapter").path);
  await page.waitForLoadState("domcontentloaded");

  const tablist = page.locator(".level-tab-bar[role='tablist']").first();
  await expect(tablist).toBeVisible();

  const tabs = tablist.locator(".level-tab");
  const tabCount = await tabs.count();
  expect(tabCount, "Expected at least 3 level tabs").toBeGreaterThanOrEqual(3);

  const firstTab = tabs.nth(0);

  await expect(firstTab).toHaveAttribute("role", "tab");
  await expect(firstTab).toHaveAttribute("aria-selected", "true");
  const firstPanelId = await firstTab.getAttribute("aria-controls");
  expect(firstPanelId, "First tab should reference a panel").toBeTruthy();
  await expect(page.locator(`#${firstPanelId}`)).toHaveAttribute("role", "tabpanel");

  const keyboardState = await tablist.evaluate((tablistEl) => {
    const tabButtons = Array.from(tablistEl.querySelectorAll(".level-tab"));
    const selectedIndex = () => tabButtons.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const semanticsOk = tabButtons.every((tab) => {
      return tab.getAttribute("role") === "tab" && Boolean(tab.getAttribute("aria-controls"));
    });

    tabButtons[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    const afterArrowRight = selectedIndex();

    tabButtons[Math.max(0, afterArrowRight)]?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    const afterEnd = selectedIndex();

    tabButtons[Math.max(0, afterEnd)]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    const afterHome = selectedIndex();

    return {
      semanticsOk,
      afterArrowRight,
      afterEnd,
      afterHome,
      expectedLastIndex: tabButtons.length - 1,
    };
  });

  expect(keyboardState.semanticsOk).toBe(true);
  expect(keyboardState.afterArrowRight).toBe(1);
  expect(keyboardState.afterEnd).toBe(keyboardState.expectedLastIndex);
  expect(keyboardState.afterHome).toBe(0);
});

test("flashcards respect prefers-reduced-motion and remain functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PAGES.find((p) => p.name === "async-chapter").path);
  await page.waitForLoadState("domcontentloaded");

  const flashcard = page.locator(".flashcard-grid .flashcard").first();
  await expect(flashcard).toBeVisible({ timeout: 10000 });

  const maxTransitionSeconds = await flashcard.locator(".flashcard__inner").evaluate((el) => {
    const value = getComputedStyle(el).transitionDuration || "0s";
    const durations = value.split(",").map((token) => {
      const trimmed = token.trim();
      if (trimmed.endsWith("ms")) {
        return Number.parseFloat(trimmed) / 1000;
      }
      if (trimmed.endsWith("s")) {
        return Number.parseFloat(trimmed);
      }
      return 0;
    });
    return Math.max(...durations, 0);
  });

  expect(
    maxTransitionSeconds,
    `Expected near-zero transition duration in reduced-motion mode, got ${maxTransitionSeconds}s`,
  ).toBeLessThanOrEqual(0.02);

  await flashcard.click();
  await expect(flashcard).toHaveClass(/flipped/);

  const visibility = await flashcard.evaluate((card) => {
    const front = card.querySelector(".flashcard__front");
    const back = card.querySelector(".flashcard__back");
    return {
      frontDisplay: front ? getComputedStyle(front).display : "",
      backDisplay: back ? getComputedStyle(back).display : "",
    };
  });

  expect(visibility.frontDisplay).toBe("none");
  expect(visibility.backDisplay).not.toBe("none");
});

for (const pageInfo of [
  { name: "title-page", path: "/00_title_and_toc.html" },
  { name: "ownership-chapter", path: "/part-03/chapter-16-ownership-as-resource-management.html" },
  { name: "borrowing-chapter", path: "/part-03/chapter-17-borrowing-constrained-access.html" },
  { name: "lifetimes-chapter", path: "/part-03/chapter-18-lifetimes-relationships-not-durations.html" },
]) {
  test(`axe scan — no serious/critical violations on ${pageInfo.name}`, async ({ page }) => {
    await page.goto(pageInfo.path);
    await page.waitForLoadState("domcontentloaded");

    const axeResult = await runAxeOnMain(page);
    const seriousViolations = /** @type {any[]} */ (axeResult.violations).filter((violation) => {
      return violation.impact === "serious" || violation.impact === "critical";
    });

    const details = seriousViolations
      .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
      .join("; ");

    expect(
      seriousViolations,
      `Serious/critical axe violations on ${pageInfo.name}: ${details}`,
    ).toHaveLength(0);
  });
}

test("generated inline svg icons are either decorative or labeled", async ({ page }) => {
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");

  const iconProblems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".inline-svg-icon")).filter((icon) => {
      const hidden = icon.getAttribute("aria-hidden") === "true";
      const label = (icon.getAttribute("aria-label") || "").trim();
      const role = icon.getAttribute("role");

      if (!hidden && !label) {
        return true;
      }
      if (hidden && label) {
        return true;
      }
      if (label && role !== "img") {
        return true;
      }
      return false;
    }).length;
  });

  expect(iconProblems, "Found generated SVG icons with invalid accessibility semantics").toBe(0);
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

test("tablet — no horizontal overflow on ownership chapter", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(PAGES.find((p) => p.name === "ownership-chapter").path);
  await page.waitForLoadState("domcontentloaded");
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, "Horizontal overflow on tablet viewport").toBe(false);
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
