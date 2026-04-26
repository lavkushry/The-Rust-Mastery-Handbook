import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    toHaveScreenshot: {
      // Tolerance is generous on purpose: snapshots are regenerated locally
      // on Linux headless Chromium but CI runs on a different Ubuntu image
      // with slightly different font hinting / subpixel anti-aliasing.
      // Typical cross-platform drift on this static docs site is ~1% of
      // pixels (~7k on a 1280x720 page, ~15k on a full-page capture).
      maxDiffPixels: 25000,
      threshold: 0.3,
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "mdbook serve --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
