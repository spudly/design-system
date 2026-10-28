/**
 * Contract test for spudly/design-system#66: Alegreya for verse
 * text in the Memorize (Quiet Dawn) theme.
 *
 * The contract:
 * 1. The base `verse` role is the existing serif stack (Georgia) on
 *    every platform — themes that declare no verse override keep
 *    today's rendering.
 * 2. Quiet Dawn's tokens override ONLY the verse role: the web stack
 *    leads with Alegreya and both native names are exactly
 *    "Alegreya" (the Memorize app bundles/registers the font under
 *    that name; a different name would silently fall back). Its UI
 *    (`sans`) role stays Raleway (#65).
 * 3. Warm Harvest's verse role is the base stack — Alegreya is a
 *    Memorize-only exception.
 * 4. The registered Tamagui `verse` font follows the brand config:
 *    a config built from memorizeTheme carries Alegreya, one built
 *    from eciperayTheme carries the base serif family.
 * 5. VerseText and the Text `verse` variant reference the registered
 *    font (`$verse`); neither names the serif token (or any family)
 *    directly anymore.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both). The source scan reads source.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "..", "src");

const { tokens, baseTheme, eciperayTheme, memorizeTheme, createTamaguiConfig } =
  await import("../dist/index.js");

test("the base verse role is the serif stack on every platform", () => {
  const { fontFamily } = tokens.typography;
  assert.equal(fontFamily.verse, "Georgia, 'Times New Roman', serif");
  assert.equal(fontFamily.verseNative, "Georgia");
  assert.equal(fontFamily.verseNativeAndroid, "serif");
  assert.equal(baseTheme.tokens.typography.fontFamily.verse, fontFamily.verse);
});

test("Quiet Dawn overrides the verse role to Alegreya and nothing else", () => {
  const family = memorizeTheme.tokens.typography.fontFamily;
  assert.ok(
    family.verse.startsWith("Alegreya,"),
    `Quiet Dawn web verse stack must lead with Alegreya, got: ${family.verse}`,
  );
  assert.equal(family.verseNative, "Alegreya");
  assert.equal(family.verseNativeAndroid, "Alegreya");
  // The UI roles are untouched: Raleway still governs headings/body.
  assert.equal(family.sans, tokens.typography.fontFamily.sans);
  assert.equal(family.sansNative, "Raleway");
});

test("Warm Harvest keeps the base verse stack", () => {
  const family = eciperayTheme.tokens.typography.fontFamily;
  assert.equal(family.verse, tokens.typography.fontFamily.verse);
  assert.equal(family.verseNative, "Georgia");
});

test("the registered verse font follows the brand config", () => {
  // The registered family is platform-resolved (web stack in this
  // environment; a single native name on device), so assert on the
  // leading family rather than one platform's exact form.
  const memorizeConfig = createTamaguiConfig(memorizeTheme);
  assert.ok(
    memorizeConfig.fonts.verse.family.startsWith("Alegreya"),
    `Memorize config verse font must lead with Alegreya, got: ${memorizeConfig.fonts.verse.family}`,
  );
  const eciperayConfig = createTamaguiConfig(eciperayTheme);
  assert.ok(
    !eciperayConfig.fonts.verse.family.includes("Alegreya"),
    `Eciperay config verse font must stay on the base serif stack, got: ${eciperayConfig.fonts.verse.family}`,
  );
  assert.ok(
    eciperayConfig.fonts.verse.family.startsWith("Georgia"),
    `Eciperay config verse font must lead with Georgia, got: ${eciperayConfig.fonts.verse.family}`,
  );
});

test("verse components reference the registered $verse font", () => {
  for (const rel of ["components/VerseText.tsx", "components/Text.tsx"]) {
    const text = readFileSync(join(srcDir, rel), "utf8");
    assert.ok(text.includes('fontFamily: "$verse"'), `${rel} must use the $verse font`);
    assert.ok(
      !text.includes("fontFamily.serif"),
      `${rel} must not pin the serif token for verse text`,
    );
  }
});
