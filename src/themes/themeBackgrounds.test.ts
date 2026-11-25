/**
 * Contract test for the brand themes' body backgrounds.
 *
 * History: #68 required Warm Harvest and Quiet Dawn to carry
 * genuinely distinct backgrounds (Quiet Dawn took a cool dawn tint
 * so the two themes would not share near-identical warm
 * off-whites). #849 (Stephen's brief-wins call, 2026-11-25)
 * superseded that: the design brief's warm paper #faf8f2 is Quiet
 * Dawn's correct background even though it sits close to Warm
 * Harvest's #faf6f0.
 *
 * The contract now:
 * 1. Each theme carries its exact brief background: Warm Harvest
 *    #faf6f0, Quiet Dawn #faf8f2.
 * 2. Quiet Dawn's text and muted text keep WCAG AA contrast on its
 *    background, and its white surface stays distinguishable
 *    from the background.
 * 3. The registered Tamagui light theme for Quiet Dawn carries the
 *    brief background value.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

const { eciperayTheme, memorizeTheme, createTamaguiConfig }: Record<string, any> =
  await loadInternalDist();

function rgb(hex: any) {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}

function distance(a: any, b: any) {
  const ca = rgb(a);
  const cb = rgb(b);
  return Math.hypot(ca[0] - cb[0], ca[1] - cb[1], ca[2] - cb[2]);
}

function luminance(hex: any) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: any, b: any) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

test("each brand theme carries its exact brief background", () => {
  assert.equal(eciperayTheme.semantic.background, "#faf6f0", "Warm Harvest keeps its warm cream");
  assert.equal(
    memorizeTheme.semantic.background,
    "#faf8f2",
    "Quiet Dawn carries the brief's warm paper (#849)",
  );
});

test("Quiet Dawn text keeps AA contrast on the brief background", () => {
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
  assert.equal(config.themes.light.background.val, "#faf8f2");
});
