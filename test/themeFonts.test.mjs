/**
 * Contract test for spudly/design-system#65: Raleway is the font
 * for all themes.
 *
 * Headings and body both resolve through the `sans` role (the
 * Tamagui registration uses one font for body and heading — see
 * buildBrandFonts), so pinning the `sans` role pins both. The
 * contract:
 * 1. The base token stack leads with Raleway, and the native and
 *    Android single names are exactly "Raleway" (apps register a
 *    font under that name; a different name here would silently
 *    fall back to the platform default sans).
 * 2. Every theme (base, Warm Harvest, Quiet Dawn) resolves its
 *    `sans` role to the same Raleway values — no per-theme UI
 *    stack survives (Warm Harvest was Georgia, Quiet Dawn was
 *    Avenir Next).
 * 3. The `serif` role is untouched: verse/reading text is the
 *    deliberate exception to the Raleway rule (Memorize verse
 *    text gets Alegreya in #66, not Raleway here).
 * 4. No source file outside the token/theme definitions hardcodes
 *    a UI font family — components and stories read the token.
 *    (The mono role in SecretRevealPanel and the serif verse
 *    role in Text/VerseText are token reads, not literals.)
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both). The hardcoded-family scan reads source.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "..", "src");

const { tokens, baseTheme, eciperayTheme, memorizeTheme } = await import("../dist/index.js");

test("the base sans stack leads with Raleway on every platform", () => {
  const { fontFamily } = tokens.typography;
  assert.ok(
    fontFamily.sans.startsWith("Raleway,"),
    `web stack must lead with Raleway, got: ${fontFamily.sans}`,
  );
  assert.equal(fontFamily.sansNative, "Raleway");
  assert.equal(fontFamily.sansNativeAndroid, "Raleway");
});

test("all themes resolve the sans role to the base Raleway values", () => {
  const base = baseTheme.tokens.typography.fontFamily;
  for (const [name, theme] of [
    ["eciperayTheme", eciperayTheme],
    ["memorizeTheme", memorizeTheme],
  ]) {
    const family = theme.tokens.typography.fontFamily;
    assert.equal(family.sans, base.sans, `${name} web stack must be the base Raleway stack`);
    assert.equal(family.sansNative, "Raleway", `${name} native name must be Raleway`);
    assert.equal(family.sansNativeAndroid, "Raleway", `${name} Android name must be Raleway`);
    assert.equal(
      family.sansNativeFaces,
      undefined,
      `${name} must not declare per-weight faces — Raleway registers as one variable family`,
    );
  }
});

test("the serif verse role is unchanged by the Raleway adoption", () => {
  assert.equal(tokens.typography.fontFamily.serif, "Georgia, 'Times New Roman', serif");
});

test("no component, page, or story hardcodes a UI font family", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name)) {
        const text = readFileSync(path, "utf8");
        // A fontFamily literal naming a family (quoted value) is a
        // hardcode; token reads (`fontFamily: tokens...`,
        // `fontFamily.sans`) and the type-level BrandFontFamily
        // declarations carry no quoted family name on the value side.
        // A `$`-prefixed value is a Tamagui font-token reference
        // (`fontFamily: "$verse"`, #66), not a family literal — the
        // family itself still comes from the theme's tokens.
        for (const match of text.matchAll(/fontFamily:\s*"([^"]+)"/g)) {
          if (match[1].startsWith("$")) continue;
          offenders.push(`${path}: fontFamily: "${match[1]}"`);
        }
      }
    }
  };
  walk(join(srcDir, "components"));
  walk(join(srcDir, "pages"));
  assert.deepEqual(offenders, [], "UI font families must come from the theme token (#65)");
});

test("Storybook loads Raleway so stories render the real typeface", () => {
  const head = readFileSync(join(here, "..", ".storybook", "preview-head.html"), "utf8");
  assert.match(head, /family=Raleway/, "preview-head must load Raleway from Google Fonts");
});
