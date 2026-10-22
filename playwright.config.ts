import { defineConfig, devices } from "@playwright/test";

/**
 * Visual-regression tests for the built Storybook (see
 * docs/visual-regression.md). The suite enumerates stories from the built
 * Storybook's index.json, so `npm run build-storybook` must run first —
 * both locally and in CI (.github/workflows/visual.yml).
 *
 * Baselines are committed in-repo under visual/ and were generated on
 * Linux with this exact Playwright/Chromium pairing; regenerate them the
 * same way (or via the workflow_dispatch baseline job) rather than on
 * macOS/Windows, where system-font fallback changes rendering.
 */
export default defineConfig({
  testDir: "./visual",
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      // Font anti-aliasing differs slightly between machines; allow a
      // small ratio of differing pixels. Kept at 1%: the mutation check
      // for issue #42 showed 2% was enough to hide a full colour change
      // on a content-width button inside a multi-row story.
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:6006",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } },
    },
  ],
  webServer: {
    command: "node visual/serve-static.mjs storybook-static 6006",
    url: "http://127.0.0.1:6006/index.json",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
