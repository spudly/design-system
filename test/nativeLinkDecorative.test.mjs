/**
 * Contract test for the LinkOverlay family's decorative-text
 * hiding (PR #295, CodeRabbit round on ad8d06a).
 *
 * The native link renderings mark the frame's visible texts
 * decorative so the overlay's composed label is the surface's one
 * accessibility stop. On Android, `accessible={false}` alone does
 * not do that: React Native's Text view managers implement the
 * `accessible` setter as `isFocusable` only, leaving
 * `importantForAccessibility` at AUTO, so the text still enters
 * the accessibility tree and TalkBack reaches it as its own stop.
 * The Android descendant-hiding value is what removes it. This
 * test pins the pair: every decorative `accessible` conditional in
 * the family's render-content functions is accompanied by the
 * matching `importantForAccessibility` conditional.
 *
 * It also pins MealsHubPage's native overlay label composing the
 * row's subtitle (the family's standing rule — RecipesPage and
 * MealDetailPage already composed title + subtitle): with the
 * visible texts hidden, a title-only label would drop the recipe
 * count and nutrition summary from the announcement. The web
 * anchor keeps its title-only label (pre-existing behavior).
 *
 * Source scan, not a render test: the failures it guards happen
 * on Android accessibility services, which no JS renderer in this
 * repo exercises, and the invariant is a per-literal property of
 * the source. Comments are stripped before scanning so the
 * explanatory comments on the fix cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function codeOf(rel) {
  const source = readFileSync(join(here, "..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function count(code, literal) {
  return code.split(literal).length - 1;
}

// The family's render-content functions flag their decorative
// variant `decorative` (MediaRow's is named `native`, inherited
// from RecipesPage), and the third element is the file's
// decorative-text count. Two of the surfaces live in the
// generic row components since the #119 extractions: the plan
// rows in CardRow and the entry rows in ListRow. The recipe
// list's rows are RecipesPage's page-local MediaRow
// composition (Stephen's tranche rule, 2026-10-29), so its
// surface is the page file itself.
const FAMILY = [
  ["src/components/OptionCard.tsx", "decorative", 3],
  ["src/components/CardRow.tsx", "decorative", 2],
  ["src/components/ListRow.tsx", "decorative", 2],
  ["src/pages/RecipesPage.tsx", "native", 2],
  ["src/pages/MealDetailPage.tsx", "decorative", 2],
  ["src/pages/MealsHubPage.tsx", "decorative", 2],
];

for (const [rel, flag, expectedCount] of FAMILY) {
  test(`${rel}: every decorative text is hidden from Android accessibility too`, () => {
    const code = codeOf(rel);
    const accessibleCount = count(code, `accessible={${flag} ? false : undefined}`);
    const hiddenCount = count(
      code,
      `importantForAccessibility={${flag} ? "no-hide-descendants" : undefined}`,
    );
    // The exact count is pinned, not just the pairing: a text
    // that lost BOTH props would leave the pairing counts equal
    // (CodeRabbit round on 0dcf5b1), so the family's size is part
    // of the contract — a new decorative text updates it
    // consciously.
    assert.equal(
      accessibleCount,
      expectedCount,
      `${rel} must mark exactly its ${expectedCount} native-rendering texts decorative`,
    );
    assert.equal(
      hiddenCount,
      accessibleCount,
      `${rel}: each decorative accessible={false} needs the matching importantForAccessibility="no-hide-descendants" — accessible={false} alone leaves the text in Android's accessibility tree`,
    );
  });
}

test("MealsHubPage's native overlay label composes the subtitle; the web anchor keeps its title-only label", () => {
  const code = codeOf("src/pages/MealsHubPage.tsx");
  // The matched source literal itself contains template
  // placeholders; interpolate the "$" signs so this file's lint
  // (no placeholder-looking text in plain strings) stays quiet.
  const dollar = "$";
  assert.equal(
    count(
      code,
      `accessibilityLabel={meal.subtitle ? \`${dollar}{meal.title}, ${dollar}{meal.subtitle}\` : meal.title}`,
    ),
    1,
    "the native LinkOverlay's label must carry the subtitle — the visible texts are hidden, so a title-only label drops the recipe count and nutrition summary",
  );
  assert.equal(
    count(code, "accessibilityLabel: meal.title"),
    1,
    "the web anchor's title-only label is pre-existing behavior and stays unchanged",
  );
});
