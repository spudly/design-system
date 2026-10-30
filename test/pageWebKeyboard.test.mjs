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

test("button-role stack pressables are keyboard-operable on web (#237, CodeRabbit PR #243)", () => {
  // A Tamagui stack carrying role="button" is a div: without
  // tabIndex + an Enter/Space handler it announces as a button that
  // the keyboard cannot reach. The MealPlansPage rows set the
  // pattern; the AiSessionPage Cancel control and the
  // RecipeDetailPage Custom scale chip must follow it.
  assert.match(aiSession, /onKeyDown=\{handleCancelKeyDown\}/);
  assert.match(aiSession, /tabIndex=\{0\}/);
  // The scale control is no longer a page-level stack pressable:
  // PresetValueSelector's Custom slot is a DS Button.
  assert.ok(!recipeDetail.includes("handleCustomScaleKeyDown"), "the scale pressable retired");
  assert.match(recipeDetail, /<PresetValueSelector/);
});

test("busy Cancel is keyboard-guarded and the Custom scale name carries the multiplier (#237)", () => {
  // pointerEvents="none" does not stop key events on a focused
  // control, so the Cancel handler must refuse activation while busy
  // and the control must expose its disabled state.
  assert.match(aiSession, /if \(busy\) return;/);
  assert.match(aiSession, /accessibilityState: \{ disabled: busy \}/);
  // The press path shares the busy guard: an assistive-technology
  // virtual click can reach onPress despite pointerEvents="none"
  // (CodeRabbit finding on PR #241).
  assert.match(aiSession, /onPress=\{handleCancel\}/);
  assert.match(aiSession, /const handleCancel = \(\) => \{\s+if \(busy\) return;/);
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
