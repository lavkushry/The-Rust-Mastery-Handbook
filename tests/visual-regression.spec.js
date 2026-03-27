import { test, expect } from '@playwright/test';
import path from 'path';

const SITE_URL = 'http://localhost:3000';

const pagesToTest = [
  { name: 'title-page', url: '/' },
  { name: 'part-01', url: '/part-01/index.html' },
  { name: 'ownership-first-contact', url: '/part-02/chapter-10-ownership-first-contact.html' },
  { name: 'borrowing-first-contact', url: '/part-02/chapter-11-borrowing-and-references-first-contact.html' },
];

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('Visual Regression', () => {
  for (const pageTest of pagesToTest) {
    for (const viewport of viewports) {
      test(`Screenshot: ${pageTest.name} on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);

        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto(`${SITE_URL}${pageTest.url}`, { waitUntil: 'networkidle' });

        // Ensure no runtime JS errors
        expect(errors.length).toBe(0);

        // Allow components to mount and images to fully render
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1000);

        // Hide elements that cause flaky layout shifts for visual regression tests
        await page.evaluate(() => {
          const main = document.querySelector('#mdbook-content main');
          if (main) main.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';

          // Disable smooth scrolling as it can cause rendering differences
          document.documentElement.style.scrollBehavior = 'auto';

          // Force layout calculation
          document.body.offsetHeight;
        });
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageTest.name}-${viewport.name}-light.png`, {
            fullPage: true,
            maxDiffPixelRatio: 0.1, // Relaxed tolerance for sub-pixel rendering across environments but strict enough to catch regressions
            animations: "disabled",
            caret: "hide",
            timeout: 10000,
        });

        // Test dark mode
        await page.evaluate(() => {
            document.documentElement.classList.add('navy');
        });
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${pageTest.name}-${viewport.name}-dark.png`, {
            fullPage: true,
            maxDiffPixelRatio: 0.1,
            animations: "disabled",
            caret: "hide",
            timeout: 10000,
        });
      });
    }
  }
});
