/**
 * Page-level keyboard-operability contracts for web (#237).
 *
 * Split out of pageWebAria.test.mjs, which outgrew the repo's
 * max-lines cap when the #119 tranche update rounds unioned two
 * branches' page lists into it; the assertions are unchanged.
 * These are source scans (comments stripped first, like the other
 * contract tests here, so prose cannot satisfy or trip the
 * patterns): a Tamagui stack carrying role="button" is a div, so
 * without tabIndex + an Enter/Space handler it announces as a
 * button the keyboard cannot reach.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

// Shared by the two #237 page-pattern tests below (hoisted so each
// page source is read once).
const aiSession = readCode("src/pages/AiSessionPage.tsx");
const recipeDetail = readCode("src/pages/RecipeDetailPage.tsx");

test("button-role pressables are keyboard-operable on web (#237, CodeRabbit PR #243)", () => {
  // A Tamagui stack carrying role="button" is a div: without
  // tabIndex + an Enter/Space handler it announces as a button that
  // the keyboard cannot reach. The MealPlansPage rows set the
  // pattern; AiSessionPage's Cancel control reaches the same
  // semantics by composing TextAction inline (whose tabIndex +
  // Enter/Space handler textAction.test.mjs pins), and the
  // RecipeDetailPage Custom scale chip must follow it.
  assert.match(aiSession, /<TextAction\s+onPress=\{onCancel\}\s+disabled=\{busy\}/);
  assert.match(aiSession, /accessibilityLabel="Cancel session"/);
  // The scale control is no longer a page-level stack pressable:
  // PresetValueSelector's Custom slot is a DS Button.
  assert.ok(!recipeDetail.includes("handleCustomScaleKeyDown"), "the scale pressable retired");
  assert.match(recipeDetail, /<PresetValueSelector/);
});

test("busy Cancel is activation-guarded and the Custom scale name carries the multiplier (#237)", () => {
  // pointerEvents="none" does not stop key events on a focused
  // control, so the Cancel control must refuse activation while
  // busy and expose its disabled state: the page's busy flag
  // drives the wrapper stack, which dims and blocks the pointer,
  // and the TextAction's `disabled`, whose press/key handlers
  // refuse activation while disabled (pinned in
  // textAction.test.mjs) — covering the assistive-technology
  // virtual click that can reach onPress despite
  // pointerEvents="none" (CodeRabbit finding on PR #241).
  assert.match(aiSession, /opacity=\{busy \? 0\.5 : 1\} pointerEvents=\{busy \? "none" : "auto"\}/);
  assert.match(aiSession, /disabled=\{busy\}/);
  // The selected custom-scale button shows the multiplier as its visible
  // text; the accessible name must include it (composed in the selector).
  assert.match(recipeDetail, /customAccessibilityLabel="Custom scale"/);
  assert.match(
    recipeDetail,
    /formatCustomValue=\{\(custom\) => `\$\{formatScaleValue\(custom\)\}×`\}/,
  );
  const selector = readCode("src/components/PresetValueSelector.tsx");
  assert.match(selector, /`\$\{customAccessibilityLabel\} \$\{formattedCustom\}`/);
});
