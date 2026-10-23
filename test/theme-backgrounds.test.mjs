/**
 * Contract test for spudly/design-system#68: Warm Harvest and
 * Quiet Dawn must not share (nearly) the same body background.
 *
 * The contract:
 * 1. Warm Harvest keeps its warm cream #faf6f0; Quiet Dawn's
 *    background is a genuinely different color — RGB distance well
 *    beyond a rounding difference — with a cool/teal cast (green
 *    and blue channels at or above the red channel), where Warm
 *    Harvest is warm (red above blue).
 * 2. Quiet Dawn's text and muted text keep WCAG AA contrast on its
 *    new background, and its white surface stays distinguishable
 *    from the background.
 * 3. The registered Tamagui light theme for Quiet Dawn carries the
 *    new background value.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

const { eciperayTheme, memorizeTheme, createTamaguiConfig } = await import("../dist/index.js");

function rgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function distance(a, b) {
  const ca = rgb(a);
  const cb = rgb(b);
  return Math.hypot(ca[0] - cb[0], ca[1] - cb[1], ca[2] - cb[2]);
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

test("the two brand themes have genuinely distinct body backgrounds", () => {
  const warm = eciperayTheme.semantic.background;
  const dawn = memorizeTheme.semantic.background;
  assert.equal(warm, "#faf6f0", "Warm Harvest keeps its warm cream");
  assert.notEqual(dawn, warm);
  assert.ok(
    distance(warm, dawn) >= 15,
    `backgrounds must differ visibly, distance was ${distance(warm, dawn).toFixed(1)}`,
  );
  const [wr, , wb] = rgb(warm);
  const [dr, dg, db] = rgb(dawn);
  assert.ok(wr > wb, "Warm Harvest background is warm (red above blue)");
  assert.ok(dg >= dr && db >= dr, `Quiet Dawn background must carry a cool cast, got ${dawn}`);
});

test("Quiet Dawn text keeps AA contrast on the new background", () => {
  const { background, surface, text, textMuted } = memorizeTheme.semantic;
  assert.ok(contrast(text, background) >= 7, `text contrast ${contrast(text, background)}`);
  assert.ok(
    contrast(textMuted, background) >= 4.5,
    `muted text contrast ${contrast(textMuted, background)}`,
  );
  assert.ok(
    distance(surface, background) >= 15,
    "white surface must stay distinguishable from the background",
  );
});

test("the registered Quiet Dawn light theme carries the new background", () => {
  const config = createTamaguiConfig(memorizeTheme);
  assert.equal(config.themes.light.background.val, memorizeTheme.semantic.background);
  assert.notEqual(config.themes.light.background.val, eciperayTheme.semantic.background);
});
