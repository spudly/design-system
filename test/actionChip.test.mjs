/**
 * Contract test for ActionChip (spudly/design-system#119), the
 * small tonal action chip extracted for the page de-styling
 * program's foundation: pages used to hand-style Button into chips
 * — RecipeDetailPage alone carried `neutralChipProps` (spread onto
 * four buttons) plus the soft-toned lifecycle actions (success /
 * danger / primary-outline) and a page-local outline action helper.
 *
 * The pins hold the shape: the chip is exported from the package
 * root, its contract is a semantic `tone` (never raw colors), the
 * tone treatments are the exact pairs the pages render today, the
 * label ink travels as an instance `color` (a styled() variant's
 * color cannot reach Tamagui Button's internal text element — the
 * lesson Button's variantLabelColors records), and the icon-only
 * form is a square target that requires an accessible name.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "ActionChip.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ActionChip is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.ActionChip, "function", "ActionChip must be exported from @spudly/ui");
});

test("ActionChipProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ActionChipProps/);
  assert.match(types, /ActionChipTone/);
});

test("the chip's contract is tone, size, press, and a label and/or icon", () => {
  assert.match(code, /tone\?: ActionChipTone;/);
  assert.match(code, /size\?: "sm" \| "md";/);
  assert.match(code, /onPress: \(\) => void;/);
  assert.match(code, /children: string;/);
  assert.match(code, /icon: ComponentType<IconComponentProps>;/);
  assert.match(
    code,
    /accessibilityLabel: string;/,
    "the icon-only shape must require an accessible name",
  );
});

test("the tones own the exact treatments the pages render today", () => {
  assert.match(code, /neutral: \{\s+backgroundColor: tokens\.colors\.gray\.gray2,/);
  assert.match(code, /danger: \{\s+backgroundColor: tokens\.colors\.danger\.danger1,/);
  assert.match(code, /success: \{\s+backgroundColor: tokens\.colors\.success\.success2,/);
  assert.match(
    code,
    /primary: \{\s+backgroundColor: "\$primarySubtle",\s+borderWidth: 1,\s+borderColor: "\$primary",/,
  );
  assert.match(
    code,
    /outline: \{\s+backgroundColor: "transparent",\s+borderWidth: 1,\s+borderColor: "\$borderColor",/,
  );
  assert.match(code, /neutral: tokens\.colors\.gray\.gray8,/);
  assert.match(code, /danger: tokens\.colors\.danger\.danger8,/);
  assert.match(code, /success: tokens\.colors\.success\.success9,/);
  assert.match(code, /primary: "\$primaryEmphasis",/);
  assert.match(code, /outline: tokens\.colors\.gray\.gray7,/);
});

test("the label ink is an instance color and the glyph ink follows the tone", () => {
  assert.match(code, /color=\{toneLabelColors\[tone\]\}/);
  assert.match(code, /<IconGlyph size=\{glyphSize\} color=\{glyphInk\} \/>/);
  assert.match(code, /fontFamily="body"/);
});

test("the icon-only form is a square target at the touch floor", () => {
  assert.match(code, /sm: 44,\s+md: 48,/);
  assert.match(code, /width: iconOnlyBox,\s+height: iconOnlyBox,/);
});

test("the chip exposes the button role with its disabled state", () => {
  assert.match(
    code,
    /accessibilityRole: "button",\s+accessibilityLabel,\s+accessibilityState: \{ disabled \},/,
  );
});

test("the href form is a link with the identical frame (Button's two-form contract)", () => {
  // The link form exists because overview/lifecycle chips navigate
  // (RecipeDetailPage's Edit chips, Tweak with AI): #248's rule
  // makes them links, and the chip's frame must not change for it.
  assert.match(code, /href: string;/, "the link form is discriminated by href");
  assert.match(code, /onPress\?: never;/, "a link takes no press callback");
  assert.match(code, /icon\?: never;/, "the link form is label-only, like Button's");
  assert.match(
    code,
    /const StyledLinkChip = styled\(Anchor, \{\s+name: "ActionChipLink",\s+\.\.\.chipFrameConfig,/,
    "the anchor frame spreads the one shared chip frame config",
  );
  assert.match(
    code,
    /const StyledChip = styled\(TamaguiButton, \{\s+name: "ActionChip",\s+\.\.\.chipFrameConfig,/,
    "the press frame spreads the same config — the forms cannot drift",
  );
  assert.match(code, /display: "web:flex",/, "the web anchor is a real flex frame");
  assert.match(code, /textDecorationLine: "none",/, "the link form drops the UA underline");
  assert.match(
    code,
    /accessibilityRole: "link",\s+accessibilityLabel,\s+accessibilityState: \{ disabled \},/,
    "the link form exposes the link role with its disabled state",
  );
  assert.match(
    code,
    /\{\.\.\.\(disabled \? \{\} : \{ href \}\)\}/,
    "a disabled link withholds its href (the ARIA disabled-link pattern)",
  );
});
