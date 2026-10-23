/**
 * Contract test for the on-device Storybook Tamagui config (#43).
 *
 * The on-device Storybook (apps/storybook) renders every story under
 * every brand in ONE process, and Tamagui keeps exactly one global
 * config (see tamagui-config.test.mjs / eciperay#149), so it uses the
 * combined brands-as-sub-themes structure of the web Storybook config.
 * Unlike the web factory — whose fonts point at CSS vars the preview
 * sets per brand, which do not exist on device — the on-device factory
 * registers native font families:
 *
 * - body/heading resolve to the family every brand registers on native:
 *   "Raleway" (a variable font the host app bundles under that name).
 * - verse resolves to Quiet Dawn's "Alegreya" (also bundled): fonts are
 *   config-global, Quiet Dawn is the brand that ships verse text, and
 *   Base / Warm Harvest verse-role text deviating to Alegreya on
 *   device is the documented trade-off in tamagui.config.ts.
 *
 * In Node the platform resolution takes the web path, so the families
 * assert as the brands' web stacks; the native names are pinned by
 * asserting the SAME resolution inputs through the per-brand factory
 * behavior covered in tamagui-config.test.mjs. What this test pins is
 * the combined structure and which brand stacks feed it.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import assert from "node:assert/strict";
import { test } from "node:test";

/** A Tamagui font family's raw value (string or Variable). */
function familyOf(font) {
  const family = font?.family;
  return family?.val ?? family;
}

test("createOnDeviceStorybookTamaguiConfig combines all brands as sub-themes", async () => {
  const pkg = await import("../dist/index.js");
  assert.equal(
    typeof pkg.createOnDeviceStorybookTamaguiConfig,
    "function",
    "the on-device factory is exported",
  );

  const config = pkg.createOnDeviceStorybookTamaguiConfig();

  for (const name of [
    "light",
    "dark",
    "light_warmHarvest",
    "dark_warmHarvest",
    "light_quietDawn",
    "dark_quietDawn",
  ]) {
    assert.ok(config.themes[name], `sub-theme ${name} exists`);
  }

  // Brand identity survives the combination: each brand sub-theme
  // carries its own semantic background, matching the per-brand configs.
  assert.equal(config.themes.light_warmHarvest.background.val, "#faf6f0");
  assert.equal(config.themes.light_quietDawn.background.val, pkg.memorizeTheme.semantic.background);
  assert.notEqual(
    config.themes.light_quietDawn.background.val,
    config.themes.light_warmHarvest.background.val,
  );
});

test("on-device config registers the Raleway body and Alegreya verse stacks", async () => {
  const pkg = await import("../dist/index.js");
  const config = pkg.createOnDeviceStorybookTamaguiConfig();

  // The stacks fed to the registration: base family for body (every
  // brand's native UI family is Raleway, #65) and Quiet Dawn's verse
  // family (Alegreya, #66). On device these resolve through the native
  // names declared beside them ("Raleway" / "Alegreya"); in Node the
  // web stacks assert directly.
  assert.equal(familyOf(config.fonts.body), pkg.baseTheme.tokens.typography.fontFamily.sans);
  assert.equal(familyOf(config.fonts.heading), pkg.baseTheme.tokens.typography.fontFamily.sans);
  assert.equal(familyOf(config.fonts.verse), pkg.memorizeTheme.tokens.typography.fontFamily.verse);
  assert.match(familyOf(config.fonts.verse), /^Alegreya/);
});
