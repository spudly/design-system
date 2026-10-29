/**
 * Contract test for MediaRow and RatingStars (spudly/design-system
 * #119, recipes-list tranche): the media list row and the star
 * control extracted from RecipesPage so the page composes
 * components instead of carrying row/link/star styling itself.
 *
 * MediaRow owns the row's card geometry (elevated card, row/wrap/
 * center, 12px rhythm), its 64px media well (the shared row
 * Thumbnail or the placeholder), the text column's 60dp wrap
 * basis, and the stage-2 (#248) two-link choreography — web
 * anchors wrapping content, the native view frame plus childless
 * LinkOverlay — while the caller supplies only domain content
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
 * Source scan plus dist export checks, like the other component
 * contract tests. Comments are stripped before scanning.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");

function code(file) {
  return readFileSync(join(componentsDir, file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const mediaRow = code("MediaRow.tsx");
const ratingStars = code("RatingStars.tsx");
const removableField = code("RemovableField.tsx");

test("MediaRow, RatingStars and RemovableField are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["MediaRow", "RatingStars", "RemovableField"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
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
  assert.match(ratingStars, /styled\(YStack, \{\s+name: "RatingStarTarget",/);
  assert.match(ratingStars, /minWidth: 44,\s+minHeight: 44,/);
  assert.match(ratingStars, /accessibilityRole: "button"/);
  assert.ok(
    !ratingStars.includes("react-native"),
    "RatingStars is root-exported — it must not import react-native (the package root loads in plain Node)",
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
