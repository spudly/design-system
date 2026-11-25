/**
 * Contract test for the mastery accent wiring (#850).
 *
 * The design brief reserves the Memorize theme's muted gold
 * #b45309 for progress/mastery states. The gold lives in the
 * semantic `accent` role; the mastery surfaces consume that
 * role — the Badge `mastery` tone's fill and the Button
 * `accent` variant's fill both resolve through the registered
 * Tamagui theme's accent value — so this test pins the role's
 * values and their contrast, entirely through imports of the
 * built output (no source reads):
 *
 * 1. Each brand theme's semantic accent is its brief value:
 *    Memorize gold #b45309, Eciperay sage #5f6f52 — the same
 *    role, per-theme values, so Eciperay's mastery surfaces
 *    follow its own accent consistently.
 * 2. The registered Tamagui light theme for Memorize carries
 *    the gold as its accent (what `$accent` resolves to for
 *    the Badge mastery tone and the Button accent variant).
 * 3. The mastery label ink (white, per Badge/Button) keeps
 *    WCAG AA text contrast (≥4.5:1) on each theme's accent,
 *    and the accent itself keeps ≥3:1 non-text contrast
 *    against the theme background.
 *
 * Run against the built output: `npm run build` first (the
 * `test` script does both).
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

test("each brand theme's semantic accent is its brief value", () => {
  assert.equal(
    memorizeTheme.semantic.accent,
    "#b45309",
    "Memorize's accent is the brief's muted gold reserved for progress/mastery",
  );
  assert.equal(
    eciperayTheme.semantic.accent,
    "#5f6f52",
    "Eciperay's accent is its sage, so its mastery surfaces follow the same role",
  );
});

test("the registered Memorize light theme carries the gold accent", () => {
  const config = createTamaguiConfig(memorizeTheme);
  assert.equal(
    config.themes.light.accent.val,
    "#b45309",
    "the $accent the mastery tone/variant fills resolve through is the gold",
  );
});

test("the white mastery label keeps AA contrast on each theme's accent", () => {
  for (const [name, theme] of [
    ["Memorize", memorizeTheme],
    ["Eciperay", eciperayTheme],
  ] as const) {
    assert.ok(
      contrast("#ffffff", theme.semantic.accent) >= 4.5,
      `${name}: white label on accent contrast ${contrast("#ffffff", theme.semantic.accent)}`,
    );
    assert.ok(
      contrast(theme.semantic.accent, theme.semantic.background) >= 3,
      `${name}: accent on background contrast ${contrast(theme.semantic.accent, theme.semantic.background)}`,
    );
  }
});
