import { existsSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

/**
 * One screenshot assertion per Storybook story per brand theme.
 *
 * Stories are enumerated from the *built* Storybook's index.json — never
 * hand-listed — so a new story gets visual coverage automatically.
 * Themes are the Storybook `theme` global from .storybook/preview.tsx:
 * Eciperay "Warm Harvest" and Memorize "Quiet Dawn", both in light mode
 * (the design brief's first-pass mode; dark variants can be added to
 * THEMES when a dark-mode bug justifies the extra baselines).
 */

const indexPath = new URL("../storybook-static/index.json", import.meta.url);

if (!existsSync(indexPath)) {
  throw new Error(
    "storybook-static/index.json not found — run `npm run build-storybook` before the visual suite.",
  );
}

interface StoryEntry {
  id: string;
  type: string;
  title: string;
  name: string;
}

const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
  entries: Record<string, StoryEntry>;
};

const stories = Object.values(index.entries)
  .filter((entry) => entry.type === "story")
  .sort((a, b) => a.id.localeCompare(b.id));

if (stories.length === 0) {
  throw new Error("Built Storybook index.json contains no stories.");
}

const THEMES = [
  { slug: "warmHarvest", global: "light_warmHarvest", label: 'Eciperay "Warm Harvest"' },
  { slug: "quietDawn", global: "light_quietDawn", label: 'Memorize "Quiet Dawn"' },
] as const;

// One deterministic PNG served in place of any external image a story
// references (Avatar's WithImage story loads picsum.photos). External
// images are nondeterministic and may be unavailable in sandboxed CI, so
// they are stubbed — the story's layout and image rendering are still
// exercised, with stable pixels.
const STUB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII=",
  "base64",
);

for (const theme of THEMES) {
  test.describe(theme.label, () => {
    for (const story of stories) {
      test(`${story.title} — ${story.name}`, async ({ page }) => {
        await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
          route.fulfill({ contentType: "image/png", body: STUB_PNG }),
        );

        await page.goto(
          `/iframe.html?id=${story.id}&viewMode=story&globals=${encodeURIComponent(
            `theme:${theme.global}`,
          )}`,
        );

        const root = page.locator("#storybook-root");
        // The story has rendered (Storybook leaves the root childless
        // until the story mounts) and no visible error overlay is showing.
        await expect
          .poll(async () => root.evaluate((el) => el.childElementCount), {
            message: "story should mount content",
            timeout: 10_000,
          })
          .toBeGreaterThan(0);
        await expect(page.locator(".sb-errordisplay").filter({ visible: true })).toHaveCount(0);

        // Wait until fonts are in and in-story images (the stubbed
        // avatar) have finished loading, so the screenshot never races
        // first render.
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            [...document.images].map((img) =>
              img.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    img.addEventListener("load", resolve, { once: true });
                    img.addEventListener("error", resolve, { once: true });
                  }),
            ),
          );
        });

        // Element screenshot of the story root, not the viewport: the
        // preview decorator wraps stories in a min-height container, and
        // a layout blow-up like the SearchField lineHeight bug
        // (eciperay#162) grows the root — a viewport shot would crop it
        // away; this catches it as a height diff. Animations are disabled
        // by the toHaveScreenshot config, so animated components
        // (Spinner, Toast) screenshot a stable frame.
        await expect(root).toHaveScreenshot(`${story.id}-${theme.slug}.png`, {
          // The decorator page background around the root is part of the
          // themed rendering; keep the full element.
          animations: "disabled",
          caret: "hide",
        });
      });
    }
  });
}
