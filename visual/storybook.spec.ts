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

        // Freeze CSS animations/transitions at their end state BEFORE
        // anything is measured or captured. Playwright's own
        // animations:"disabled" applies only while it captures, and a
        // rotating Spinner's bounding box (the axis-aligned box of the
        // rotated element) otherwise changes with the frame it happens
        // to be measured at — which made the tight-crop height below
        // flap by a couple of pixels between runs.
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              caret-color: transparent !important;
            }
          `,
        });
        // Two frames at the frozen state so layout is final before the
        // content box is measured.
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        // The stylesheet freeze above is not sufficient on its own: the
        // Spinner's rotation still advanced between runs (its measured
        // box kept changing height), so pause every animation through
        // the Web Animations API and seek it to its first frame. A
        // rotating element's axis-aligned box is then its unrotated box
        // on every run, and both screenshots capture that same frame.
        await page.evaluate(() => {
          for (const animation of document.getAnimations()) {
            try {
              animation.currentTime = 0;
              animation.pause();
            } catch {
              // A finished animation can reject a seek; it is already
              // at a stable end state, so there is nothing to freeze.
            }
          }
          // SMIL animations (SVG <animateTransform>, which the Spinner's
          // rotating SVG uses) are covered by neither the stylesheet
          // freeze nor the Web Animations API; pause them through the
          // SVG timeline instead and seek to the first frame.
          document.querySelectorAll("svg").forEach((svg) => {
            const s = svg as SVGSVGElement & {
              pauseAnimations?: () => void;
              setCurrentTime?: (t: number) => void;
            };
            try {
              s.setCurrentTime?.(0);
              s.pauseAnimations?.();
            } catch {
              // Not an animated SVG root; nothing to freeze.
            }
          });
        });

        // Measure the tight content box FIRST, before any screenshot:
        // Playwright's animations:"disabled" capture toggles animation
        // state, and a rotating Spinner's axis-aligned box depends on
        // the frame it is measured at, so a clip measured after the
        // root capture flapped by several pixels between runs. The
        // union is sampled over ~600ms and accumulated: a rotating
        // element's envelope (its full excursion) is the same on every
        // run even when individual frames are not, and static content
        // reaches that same envelope on the first sample.
        const contentClip = await root.evaluate(async (el) => {
          // Elements with a running animation — and everything inside
          // them — have no stable bounding box: the Spinner's rotating
          // <svg> reports a different axis-aligned box on every frame
          // (36×36 up to its 51×51 diagonal), which made the clip height
          // flap between runs despite the freezes above. Exclude those
          // subtrees from the union; the animated element's layout box
          // is contained in its non-animated parent's box, which is
          // measured, so no content region is lost.
          const animated = new Set<Element>();
          el.querySelectorAll("*").forEach((node) => {
            if (node.getAnimations().length > 0) {
              animated.add(node);
              node.querySelectorAll("*").forEach((child) => animated.add(child));
            }
          });
          const measure = () => {
            const rootRect = el.getBoundingClientRect();
            const rootArea = rootRect.width * rootRect.height;
            let x1 = Infinity;
            let y1 = Infinity;
            let x2 = -Infinity;
            let y2 = -Infinity;
            el.querySelectorAll("*").forEach((node) => {
              if (animated.has(node)) return;
              const r = node.getBoundingClientRect();
              if (!r.width || !r.height) return;
              if (r.width * r.height >= 0.9 * rootArea) return;
              x1 = Math.min(x1, r.left + window.scrollX);
              y1 = Math.min(y1, r.top + window.scrollY);
              x2 = Math.max(x2, r.right + window.scrollX);
              y2 = Math.max(y2, r.bottom + window.scrollY);
            });
            return Number.isFinite(x1) ? { x1, y1, x2, y2 } : null;
          };
          let acc = measure();
          if (!acc) return null;
          for (let i = 0; i < 12; i++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            const next = measure();
            if (!next) break;
            acc = {
              x1: Math.min(acc.x1, next.x1),
              y1: Math.min(acc.y1, next.y1),
              x2: Math.max(acc.x2, next.x2),
              y2: Math.max(acc.y2, next.y2),
            };
          }
          const pad = 4;
          return {
            x: Math.max(0, Math.floor(acc.x1) - pad),
            y: Math.max(0, Math.floor(acc.y1) - pad),
            width: Math.ceil(acc.x2 - acc.x1) + pad * 2,
            height: Math.ceil(acc.y2 - acc.y1) + pad * 2,
          };
        });

        // Element screenshot of the story root, not the viewport: the
        // preview decorator wraps stories in a min-height container, and
        // a layout blow-up like the SearchField lineHeight bug
        // (eciperay#162) grows the root — a viewport shot would crop it
        // away; this catches it as a height diff. Animations are disabled
        // by the toHaveScreenshot config, so animated components
        // (Spinner, Toast) screenshot a stable frame.
        await expect(root).toHaveScreenshot(`${story.id}-${theme.slug}.png`, {
          animations: "disabled",
          caret: "hide",
        });

        // Second, tight screenshot of just the rendered content (the
        // union of the visible descendant boxes, excluding the full-size
        // decorator containers). The root shot's diff budget is relative
        // to a full-viewport image, so a complete colour change on a
        // small component (an Avatar is 40×40) could hide inside it;
        // against the tight crop the same change is a large fraction of
        // the pixels and fails. Stories whose content fills the root
        // (ScreenContainer-style layouts) have no smaller box — the root
        // shot already is the tight shot for them — and stories that
        // render nothing inline (Dialog) have no content box at all.
        if (contentClip) {
          await expect(page).toHaveScreenshot(`${story.id}-${theme.slug}-content.png`, {
            clip: contentClip,
            fullPage: true,
          });
        }
      });
    }
  });
}
