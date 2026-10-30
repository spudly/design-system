/**
 * Regression test for spudly/eciperay#149 (wrong brand rendered in the
 * Eciperay app).
 *
 * Tamagui v3 keeps ONE global config: `createTamagui()` installs its
 * result as the singleton all theme/token resolution reads, and
 * `TamaguiProvider`'s `config` prop does not override it. This package
 * used to create the base, Eciperay, Memorize, and Storybook configs
 * at module scope, so importing the package left the last-created
 * (Memorize) config in charge of the Eciperay app's rendering.
 *
 * The contract now: importing the package registers NO global config;
 * each app creates its own exactly once via `createTamaguiConfig`.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";

import { getConfig } from "tamagui";

/** The installed global config, or undefined when none is installed. */
function getConfigMaybe() {
  let config;
  try {
    config = getConfig();
  } catch {
    // No config installed: getConfig() throws; absence is the signal.
  }
  return config;
}

test("importing the package registers no global Tamagui config", async () => {
  assert.equal(getConfigMaybe(), undefined, "no config before import");

  const pkg = await import("../dist/index.js");

  assert.equal(
    getConfigMaybe(),
    undefined,
    "importing @spudly/ui must not call createTamagui at module scope",
  );

  // The pre-built config exports are gone so consumers cannot
  // reintroduce the bug by importing one.
  for (const removed of [
    "tamaguiConfig",
    "eciperayTamaguiConfig",
    "memorizeTamaguiConfig",
    "storybookTamaguiConfig",
  ]) {
    assert.equal(removed in pkg, false, `${removed} must not be exported`);
  }
});

test("createTamaguiConfig installs the caller's brand as the global config", async () => {
  const { createTamaguiConfig, eciperayTheme, memorizeTheme } = await import("../dist/index.js");

  const config = createTamaguiConfig(eciperayTheme);
  assert.equal(getConfigMaybe(), config);
  assert.equal(config.themes.light.primary.val, "#c2410c");
  assert.equal(config.themes.light.background.val, "#faf6f0");

  // A different app creating its own config gets its own brand —
  // resolution follows the config that app created, not a sibling's.
  const memorizeConfig = createTamaguiConfig(memorizeTheme);
  assert.equal(getConfigMaybe(), memorizeConfig);
  assert.equal(memorizeConfig.themes.light.primary.val, "#0f766e");
});

test("resolveFontFamily attaches the declared static faces on native, none on web (#326)", async () => {
  const { resolveFontFamily, tokens } = await import("../dist/index.js");
  const { fontFamily } = tokens.typography;

  // The faces Tamagui registers for the base brand on either native
  // platform: the four static UiSans weights plus the fontWeight
  // keyword aliases, in Tamagui's face shape (weight → { normal }).
  const expectedFace = {
    "400": { normal: "UiSans" },
    "500": { normal: "UiSans-Medium" },
    "600": { normal: "UiSans-SemiBold" },
    "700": { normal: "UiSans-Bold" },
    normal: { normal: "UiSans" },
    bold: { normal: "UiSans-Bold" },
  };

  // Both config factories (per-brand and on-device Storybook) build
  // their fonts through this seam, so pinning it pins the forwarding
  // into native registration on both platform paths.
  assert.deepEqual(resolveFontFamily(fontFamily, "android"), {
    family: "UiSans",
    face: expectedFace,
  });
  assert.deepEqual(resolveFontFamily(fontFamily, "ios"), {
    family: "UiSans",
    face: expectedFace,
  });

  // Web registers the stack itself and no faces: the browser resolves
  // weights inside the loaded variable font.
  assert.deepEqual(resolveFontFamily(fontFamily, "web"), { family: fontFamily.sans });

  // A brand that declares no native names gets the generic family and
  // no faces on either native platform.
  const generic = { sans: "Example, sans-serif" };
  assert.deepEqual(resolveFontFamily(generic, "android"), { family: "sans-serif" });
  assert.deepEqual(resolveFontFamily(generic, "ios"), { family: "sans-serif" });
});
