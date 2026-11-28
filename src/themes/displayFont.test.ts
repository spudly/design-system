/**
 * Contract test for spudly/design-system#851: serif display type
 * for Eciperay page/recipe titles, at the typography-token level.
 *
 * The contract:
 * 1. The base `display` role mirrors the `sans` role on every
 *    platform (web stack, native names, and the static per-weight
 *    faces, #326) — a theme that declares no display override
 *    keeps today's sans titles.
 * 2. Warm Harvest (Eciperay) overrides ONLY the display role, to
 *    the existing serif stack: web leads with Georgia, the iOS
 *    name is "Georgia", the Android name is the generic "serif",
 *    and no per-weight faces are declared (Georgia is a system
 *    serif; the base role's UiSans faces must not carry over).
 *    Its `sans` and `verse` roles are untouched.
 * 3. Quiet Dawn (Memorize) declares no display override: its
 *    display role is the base sans-mirroring role — in particular
 *    its titles do NOT take the verse role's Alegreya.
 * 4. The registered Tamagui `display` font follows the brand
 *    config: a config built from eciperayTheme carries the serif
 *    family, one built from memorizeTheme or baseTheme carries
 *    the sans family, and the `heading` font is the display font.
 * 5. Display title weights follow the same per-brand pattern:
 *    the base `displayFontWeight` tokens carry the standard steps
 *    (semibold 600 / bold 700, identical to `fontWeight`); Warm
 *    Harvest overrides both title steps to the medium step (500)
 *    — Georgia's two faces make the intermediate semibold step
 *    render as bold, so medium is the first step that visibly
 *    lightens its serif titles (Stephen, 2026-11-25); Quiet Dawn
 *    declares no override. The registered `display` font's weight
 *    scale carries the brand's steps in its semibold/bold slots;
 *    the `body` font's scale keeps the standard steps under every
 *    brand.
 *
 * Assertions are on token values and registered config behavior
 * (imports only — no source scans).
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

const { tokens, baseTheme, eciperayTheme, memorizeTheme, createTamaguiConfig } =
  await loadInternalDist();

test("the base display role mirrors the sans role on every platform", () => {
  const { fontFamily } = tokens.typography;
  assert.equal(fontFamily.display, fontFamily.sans);
  assert.equal(fontFamily.displayNative, fontFamily.sansNative);
  assert.equal(fontFamily.displayNativeAndroid, fontFamily.sansNativeAndroid);
  assert.deepEqual(fontFamily.displayNativeFaces, fontFamily.sansNativeFaces);
  assert.deepEqual(fontFamily.displayNativeAndroidFaces, fontFamily.sansNativeAndroidFaces);
  assert.equal(baseTheme.tokens.typography.fontFamily.display, fontFamily.display);
});

test("Warm Harvest overrides the display role to the serif stack and nothing else", () => {
  const family = eciperayTheme.tokens.typography.fontFamily;
  assert.equal(family.display, "Georgia, 'Times New Roman', serif");
  assert.equal(family.display, tokens.typography.fontFamily.serif);
  assert.equal(family.displayNative, "Georgia");
  assert.equal(family.displayNativeAndroid, "serif");
  assert.equal(family.displayNativeFaces, undefined);
  assert.equal(family.displayNativeAndroidFaces, undefined);
  // The UI and verse roles are untouched.
  assert.equal(family.sans, tokens.typography.fontFamily.sans);
  assert.equal(family.sansNative, "UiSans");
  assert.equal(family.verse, tokens.typography.fontFamily.verse);
});

test("Quiet Dawn keeps the base (sans) display role — no Alegreya titles", () => {
  const family = memorizeTheme.tokens.typography.fontFamily;
  assert.equal(family.display, tokens.typography.fontFamily.display);
  assert.equal(family.displayNative, "UiSans");
  assert.equal(family.displayNativeAndroid, "UiSans");
  assert.ok(
    !family.display.includes("Alegreya"),
    `Quiet Dawn display stack must not take the verse family, got: ${family.display}`,
  );
});

test("the registered display font follows the brand config", () => {
  // The registered family is platform-resolved (web stack in this
  // environment; a single native name on device), so assert on the
  // leading family rather than one platform's exact form.
  const eciperayConfig = createTamaguiConfig(eciperayTheme);
  assert.ok(
    eciperayConfig.fonts.display.family.startsWith("Georgia"),
    `Eciperay config display font must lead with Georgia, got: ${eciperayConfig.fonts.display.family}`,
  );
  assert.equal(
    eciperayConfig.fonts.heading.family,
    eciperayConfig.fonts.display.family,
    "the heading font is the display font",
  );

  const memorizeConfig = createTamaguiConfig(memorizeTheme);
  assert.ok(
    memorizeConfig.fonts.display.family.startsWith("Raleway") ||
      memorizeConfig.fonts.display.family === "UiSans",
    `Memorize config display font must stay on the UI sans, got: ${memorizeConfig.fonts.display.family}`,
  );
  assert.ok(
    !memorizeConfig.fonts.display.family.includes("Alegreya"),
    `Memorize config display font must not be Alegreya, got: ${memorizeConfig.fonts.display.family}`,
  );

  const baseConfig = createTamaguiConfig(baseTheme);
  assert.equal(baseConfig.fonts.display.family, baseConfig.fonts.body.family);
});

test("display title weights: base steps standard, Warm Harvest at medium, Quiet Dawn inherits", () => {
  const { fontWeight, displayFontWeight } = tokens.typography;
  assert.equal(displayFontWeight.semibold, fontWeight.semibold);
  assert.equal(displayFontWeight.bold, fontWeight.bold);
  assert.deepEqual(baseTheme.tokens.typography.displayFontWeight, displayFontWeight);
  const warmHarvest = eciperayTheme.tokens.typography.displayFontWeight;
  assert.equal(warmHarvest.semibold, fontWeight.medium);
  assert.equal(warmHarvest.bold, fontWeight.medium);
  assert.deepEqual(memorizeTheme.tokens.typography.displayFontWeight, displayFontWeight);
});

function weightStep(font: unknown, key: string): string {
  const weight = (font as { weight: Record<string, { val: string } | string> }).weight[key];
  return typeof weight === "string" ? weight : weight.val;
}

test("the registered display font's weight scale carries the brand's title steps", () => {
  const { fontWeight } = tokens.typography;
  const eciperayConfig = createTamaguiConfig(eciperayTheme);
  assert.equal(weightStep(eciperayConfig.fonts.display, "3"), String(fontWeight.medium));
  assert.equal(weightStep(eciperayConfig.fonts.display, "4"), String(fontWeight.medium));
  // The body font's scale keeps the standard steps under the same brand.
  assert.equal(weightStep(eciperayConfig.fonts.body, "3"), String(fontWeight.semibold));
  assert.equal(weightStep(eciperayConfig.fonts.body, "4"), String(fontWeight.bold));

  const memorizeConfig = createTamaguiConfig(memorizeTheme);
  assert.equal(weightStep(memorizeConfig.fonts.display, "3"), String(fontWeight.semibold));
  assert.equal(weightStep(memorizeConfig.fonts.display, "4"), String(fontWeight.bold));
});
