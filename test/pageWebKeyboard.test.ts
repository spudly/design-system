/**
 * Page-level keyboard-operability contracts for web (#237).
 *
 * Split out of pageWebAria.test.ts, which outgrew the repo's
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

function readCode(rel: string) {
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
  // semantics as a real ghost Button (#464, retiring TextAction —
  // a native <button> on web, keyboard-operable by default, its
  // shape pinned in textAction.test.ts), and the
  // RecipeDetailPage Custom scale chip must follow it.
  assert.match(aiSession, /<Button\s+ghost\s+size="sm"\s+onPress=\{onCancel\}\s+disabled=\{busy\}/);
  assert.match(aiSession, /accessibilityLabel="Cancel session"/);
  // The scale control is no longer a page-level stack pressable:
  // PresetValueSelector's Custom slot is a DS Button.
  assert.ok(!recipeDetail.includes("handleCustomScaleKeyDown"), "the scale pressable retired");
  assert.match(recipeDetail, /<PresetValueSelector/);
});

test("busy Cancel is activation-guarded and the Custom scale name carries the multiplier (#237)", () => {
  // A disabled native button refuses activation and leaves the
  // tab order, so the Cancel control must expose its disabled
  // state while busy: the page's busy flag drives the ghost
  // Button's `disabled` (#464 — Button's own disabled handling
  // dims the button and refuses press/key activation, pinned in
  // textAction.test.ts), covering the assistive-technology
  // virtual click that can reach a press handler on an enabled
  // control (CodeRabbit finding on PR #241).
  assert.match(aiSession, /disabled=\{busy\}/);
  // The selected custom-scale button shows the multiplier as its visible
  // text; the accessible name must include it (composed in the selector).
  assert.match(recipeDetail, /customAccessibilityLabel="Custom scale"/);
  assert.match(
    recipeDetail,
    /formatCustomValue=\{\(custom\) => `\$\{formatScaleValue\(custom\)\}×`\}/,
  );
  const selector = readCode("src/widgets/PresetValueSelector.tsx");
  assert.match(selector, /`\$\{customAccessibilityLabel\} \$\{formattedCustom\}`/);
});
