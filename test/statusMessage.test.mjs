/**
 * Contract test for StatusMessage (spudly/design-system#318): the
 * transient action-confirmation line. Two gaps from the issue are
 * pinned:
 *
 * 1. Announcement: the old treatment (RecipeDetailPage's inline
 *    action message, extracted verbatim into PR #314's StatusMessage)
 *    rendered with accessibilityRole="text", which never announces
 *    updates. StatusMessage's root is a polite live region —
 *    `politeLiveRegionProps` from src/components/accessibility.ts
 *    (role="status" on web, accessibilityLiveRegion="polite" on
 *    native, the Alert/EmptyState pattern) — and it renders
 *    UNCONDITIONALLY (empty when there is no message), because a
 *    live region must be mounted before its content changes to
 *    announce the change. Its consumer, RecipeDetailPage, renders
 *    it unconditionally too.
 * 2. Ink: the old treatment's fixed gray7 (#525252) measures
 *    1.94:1 on the dark shell surface (gray9). StatusMessage uses
 *    the theme-aware $textMuted token, and this test recomputes
 *    its contrast from the REGISTERED themes (the progressTrack
 *    test's method): AA (≥4.5:1) against both the background and
 *    the surface in every brand theme and both modes.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "StatusMessage.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const pageSource = readFileSync(join(here, "..", "src", "pages", "RecipeDetailPage.tsx"), "utf8");
const pageCode = pageSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

const { baseTheme, eciperayTheme, memorizeTheme, createTamaguiConfig, tokens } =
  await import("../dist/index.js");

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

test("StatusMessage is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.StatusMessage,
    "function",
    "StatusMessage must be exported from @spudly/ui",
  );
});

test("the root is a polite live region via the codebase's translator props", () => {
  assert.match(code, /politeLiveRegionProps/);
  assert.match(code, /<YStack \{\.\.\.politeLiveRegionProps\}/);
  assert.doesNotMatch(code, /accessibilityRole="text"/);
  assert.doesNotMatch(code, /accessibilityRole="status"/);
});

test("the root renders unconditionally; only the message line is conditional", () => {
  assert.doesNotMatch(code, /if \(!message\)/);
  assert.doesNotMatch(code, /message \? \(\s*<YStack/);
  assert.match(code, /return \(\s*<YStack \{\.\.\.politeLiveRegionProps\}/);
  assert.match(code, /\{message \? \(/);
});

test("the ink is the theme-aware $textMuted token, never a raw ramp step or hex", () => {
  assert.match(code, /color="\$textMuted"/);
  assert.doesNotMatch(code, /gray7/);
  assert.doesNotMatch(code, /#[0-9a-fA-F]{6}/);
  assert.match(code, /textAlign="center"/);
});

test("$textMuted keeps AA contrast on background and surface in every theme and mode", () => {
  for (const theme of [baseTheme, eciperayTheme, memorizeTheme]) {
    const config = createTamaguiConfig(theme);
    for (const mode of ["light", "dark"]) {
      const ink = config.themes[mode].textMuted.val;
      for (const surfaceKey of ["background", "surface"]) {
        const surface = config.themes[mode][surfaceKey].val;
        assert.ok(
          contrast(ink, surface) >= 4.5,
          `$textMuted ${ink} on ${mode} ${surfaceKey} ${surface} is ${contrast(ink, surface).toFixed(2)}:1, below AA 4.5:1`,
        );
      }
    }
  }
});

test("the old gray7 ink fails on the dark surface — the gap $textMuted closes", () => {
  const config = createTamaguiConfig(baseTheme);
  const darkSurface = config.themes.dark.surface.val;
  assert.ok(
    contrast(tokens.colors.gray.gray7, darkSurface) < 3,
    `gray7 on dark surface should be low-contrast, got ${contrast(tokens.colors.gray.gray7, darkSurface).toFixed(2)}:1`,
  );
  assert.ok(contrast(config.themes.dark.textMuted.val, darkSurface) >= 4.5);
});

test("RecipeDetailPage renders StatusMessage unconditionally for its action message", () => {
  assert.match(pageCode, /import \{ StatusMessage \} from "\.\.\/components\/StatusMessage\.js"/);
  assert.match(pageCode, /<StatusMessage message=\{actionMessage\} \/>/);
  assert.doesNotMatch(pageCode, /\{actionMessage \? \(/);
  assert.doesNotMatch(pageCode, /accessibilityRole="text"/);
});

test("stories cover the message, the mounted-empty region, and the transient toggle", () => {
  const stories = readFileSync(
    join(here, "..", "src", "components", "StatusMessage.stories.tsx"),
    "utf8",
  );
  for (const name of ["Default", "Empty", "Transient"]) {
    assert.match(stories, new RegExp(`export const ${name}: Story`), `${name} story missing`);
  }
});
