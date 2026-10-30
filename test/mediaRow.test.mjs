/**
 * Contract test for RecipesPage's page-local MediaRow and
 * RatingStars compositions (spudly/design-system #119,
 * recipes-list tranche): the media list row and the star
 * control the recipes list renders. They were briefly library
 * components in this tranche; Stephen's tranche rule
 * (2026-10-29) — a tranche PR adds no library components —
 * moved them into the page, where they are composed from the
 * shared Card, Thumbnail, Text, and LinkOverlay components and
 * exported from nowhere. This test pins both halves of that:
 * the compositions' contracts below, and their absence from
 * the built package root.
 *
 * MediaRow owns the row's card geometry (elevated card, row/wrap/
 * center, 12px rhythm), its 64px media well (the shared row
 * Thumbnail or the placeholder), the text column's 60dp wrap
 * basis, and the stage-2 (#248) two-link choreography — web
 * anchors wrapping content, the native view frame plus childless
 * LinkOverlay — while the page supplies only domain content
 * (href, title, subtitle, image) and slots (subtitleAction,
 * accessory). It is never pressable and renders no button: the
 * row's action, when one exists, is the caller's subtitleAction.
 *
 * RatingStars owns the star language in both forms: the static
 * five-star display (fill by rounding, warning amber / gray)
 * and the pressable log-cook form (44dp target, single unfilled
 * star when unrated, press cancels the click default first — the
 * control typically sits inside the row's text link). Its
 * contract depth lives here and in
 * test/recipesPageRowActions.test.mjs.
 *
 * Source scan plus dist export checks, like the other contract
 * tests. The scans slice RecipesPage.tsx at the compositions'
 * markers so page-level code cannot satisfy them. Comments are
 * stripped before scanning.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");

function strip(source) {
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function code(file) {
  return strip(readFileSync(join(componentsDir, file), "utf8"));
}

const page = strip(readFileSync(join(here, "..", "src", "pages", "RecipesPage.tsx"), "utf8"));
const mediaRow = page.slice(page.indexOf("const textBlockStyle"), page.indexOf("const STAR_STEPS"));
const ratingStars = page.slice(page.indexOf("const STAR_STEPS"));
const removableField = code("RemovableField.tsx");

test("RemovableField is exported from the built package root; the page-local row and star control are not", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.RemovableField,
    "function",
    "RemovableField must be exported from @spudly/ui",
  );
  for (const name of ["MediaRow", "RatingStars"]) {
    assert.equal(
      dist[name],
      undefined,
      `${name} is a RecipesPage-local composition — it must not be exported from @spudly/ui`,
    );
  }
});

test("MediaRow's card owns the row geometry; the text column keeps its 60dp wrap basis", () => {
  assert.match(
    mediaRow,
    /<Card variant="elevated" flexDirection="row" flexWrap="wrap" alignItems="center" gap="\$3">/,
  );
  assert.match(mediaRow, /flexBasis: 60/);
});

test("the media is the shared row Thumbnail; the placeholder well is its geometry in gray2", () => {
  assert.match(mediaRow, /<Thumbnail src=\{imageUrl\} variant="row" \/>/);
  assert.match(mediaRow, /width="\$16"\s+height="\$16"/);
  assert.match(mediaRow, /backgroundColor=\{tokens\.colors\.gray\.gray2\}/);
});

test("MediaRow takes content and slots only — no styling props, no domain fields", () => {
  for (const banned of ["spaceBefore", "spaceAfter", "className"]) {
    assert.ok(!mediaRow.includes(banned), `MediaRow must not mention ${banned}`);
  }
  assert.ok(!mediaRow.includes("recipe"), "MediaRow is domain-free — no recipe concepts");
  assert.match(mediaRow, /subtitleAction\?: ReactNode;/);
  assert.match(mediaRow, /accessory\?: ReactNode;/);
});

test("the card and the accessory each sit in the under-row padded wrapper (the row's own 12px)", () => {
  assert.equal(mediaRow.split('paddingBlockEnd="$3"').length - 1, 2);
});

test("RatingStars' pressable target is ≥44dp and carries the button role", () => {
  assert.match(ratingStars, /minWidth=\{44\}\s+minHeight=\{44\}/);
  assert.match(ratingStars, /accessibilityRole: "button"/);
  assert.ok(
    !ratingStars.includes("react-native"),
    "the page-local star control renders through Tamagui only — it must not import react-native",
  );
});

test("RatingStars' button form requires its accessible name in the type", () => {
  assert.match(
    ratingStars,
    /\(RatingStarsBase & \{ onPress: \(\) => void; accessibilityLabel: string \}\)/,
    "with onPress the label is required — the stars alone would announce as a rating",
  );
  assert.match(ratingStars, /if \(!props\.onPress\)/);
});

test("RatingStars' button is keyboard-operable on web (the CardRow pattern)", () => {
  assert.match(ratingStars, /tabIndex=\{0\}/);
  assert.match(ratingStars, /onKeyDown=\{handleKeyDown\}/);
  assert.match(ratingStars, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(
    ratingStars,
    /if \(!event\.repeat\) onPress\(\);/,
    "a held key must not re-fire the press on keydown repeats",
  );
});

test("RemovableField pairs the field with its end-aligned ghost Remove button at a 4px gap", () => {
  assert.match(removableField, /<YStack gap=\{tokens\.spacing\[1\]\}>/);
  assert.match(removableField, /<XStack justifyContent="flex-end">/);
  assert.match(removableField, /variant="ghost"\s+size="sm"/);
  assert.match(removableField, /onPress=\{onRemove\}/);
});
