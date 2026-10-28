/**
 * Contract test for spudly/design-system#94: in Quiet Dawn LIGHT the
 * ProgressBar's second color (the unfilled track) is a light gray,
 * not the light-blue teal tint.
 *
 * The contract:
 * 1. The track color is its own semantic role (`progressTrack`), so
 *    the change cannot leak into the other primarySubtle consumers
 *    (Badge, Avatar, Alert, ghost button) — Quiet Dawn's
 *    primarySubtle itself stays teal2.
 * 2. Quiet Dawn light's progressTrack is a genuine light gray:
 *    neutral (equal RGB channels) and light.
 * 3. The $primary fill keeps ≥3:1 WCAG non-text contrast against the
 *    track in every brand and mode.
 * 4. Dark mode is unchanged (Stephen's request was light-only): the
 *    registered dark theme's track still resolves to the theme's
 *    primarySubtle tint, and Warm Harvest / base tracks also stay
 *    their primarySubtle tints.
 * 5. ProgressBar renders its track from $progressTrack.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const { baseTheme, eciperayTheme, memorizeTheme, createTamaguiConfig } =
  await import("../dist/index.js");

function rgb(hex) {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

test("Quiet Dawn light progressTrack is a light gray, and primarySubtle stays teal", () => {
  const track = memorizeTheme.semantic.progressTrack;
  const [r, g, b] = rgb(track);
  assert.ok(r === g && g === b, `progressTrack must be a neutral gray, got ${track}`);
  assert.ok(r >= 200, `progressTrack must be light, got ${track}`);
  assert.equal(
    memorizeTheme.semantic.primarySubtle,
    "#ccfbf1",
    "primarySubtle must stay teal2 — Badge/Avatar/Alert were not part of the #94 call",
  );
});

test("registered themes resolve the track per brand and mode", () => {
  const dawn = createTamaguiConfig(memorizeTheme);
  assert.equal(dawn.themes.light.progressTrack.val, memorizeTheme.semantic.progressTrack);
  assert.equal(
    dawn.themes.dark.progressTrack.val,
    memorizeTheme.semantic.primarySubtle,
    "dark mode is unchanged by #94: its track keeps the primarySubtle tint",
  );
  const harvest = createTamaguiConfig(eciperayTheme);
  assert.equal(harvest.themes.light.progressTrack.val, eciperayTheme.semantic.primarySubtle);
  assert.equal(harvest.themes.dark.progressTrack.val, eciperayTheme.semantic.primarySubtle);
  const base = createTamaguiConfig(baseTheme);
  assert.equal(base.themes.light.progressTrack.val, baseTheme.semantic.primarySubtle);
});

test("the fill keeps at least 3:1 contrast against the track in every brand and mode", () => {
  for (const theme of [baseTheme, eciperayTheme, memorizeTheme]) {
    const config = createTamaguiConfig(theme);
    for (const mode of ["light", "dark"]) {
      const fill = config.themes[mode].primary.val;
      const track = config.themes[mode].progressTrack.val;
      assert.ok(
        contrast(fill, track) >= 3,
        `fill ${fill} on track ${track} (${mode}) is ${contrast(fill, track).toFixed(2)}:1, below 3:1`,
      );
    }
  }
});

test("ProgressBar renders its track from $progressTrack", () => {
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "ProgressBar.tsx"),
    "utf8",
  );
  assert.ok(
    /backgroundColor: "\$progressTrack"/.test(src),
    "ProgressBar's track must use the $progressTrack role (#94)",
  );
});
