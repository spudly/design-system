/**
 * Contract test for StepList (spudly/design-system#119,
 * recipes-detail tranche): the procedure step cards extracted
 * from RecipeDetailPage's instructions (PublicRecipePage's
 * identical steps adopt it with that page's tranche).
 *
 * The pins hold the list's semantics: the active step is
 * ephemeral state the list owns (first step active by default,
 * as the app's instructions tab held it), exactly one step
 * renders in the active treatment, and activation follows the
 * ListItem keyboard pattern.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, "../../..", "src", "widgets", "data", "StepList.tsx"),
  "utf8",
);
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("StepList is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.StepList,
    "function",
    "StepList must be exported from the internal components barrel",
  );
});

test("the list owns the active step, first step active by default", () => {
  assert.match(code, /const \[activeIndex, setActiveIndex\] = useState\(0\);/);
  assert.match(code, /const isActive = i === activeIndex;/);
  assert.match(
    code,
    /borderColor=\{isActive \? "\$primary" : tokens\.colors\.gray\.gray2\}/,
    "the active card takes the primary treatment",
  );
  assert.match(code, /accessibilityState: \{ selected: isActive \}/);
});

test("the numeral presentation is opt-in: a flat row with an orange numeral and period (#721)", () => {
  assert.match(code, /presentation\?: "eyebrow" \| "numeral";/);
  assert.match(code, /presentation = "eyebrow"/, "the eyebrow presentation stays the default");
  assert.match(
    code,
    /if \(presentation === "numeral"\) \{\s+return \(\s+<Col/,
    "the numeral presentation renders its own flat row, not the eyebrow card",
  );
  assert.match(code, /fontSize=\{tokens\.typography\.fontSize\["2xl"\]\}/);
  assert.match(code, /color="\$primary"/);
  assert.match(
    code,
    /\{step\.number \?\? i \+ 1\}\./,
    "the numeral is the step's own number when supplied, else its position, followed by a period",
  );
});

test("step activation is keyboard-operable on web (the ListItem pattern)", () => {
  assert.match(code, /tabIndex=\{0\}/);
  assert.match(code, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(code, /setActiveIndex\(i\)/, "keys and presses activate the same step");
});

test("the loading state renders skeleton cards in the cards' own geometry (#747, ex-RecipeInstructionsPanel)", () => {
  assert.match(code, /loading\?: boolean/, "StepList declares the explicit loading prop");
  assert.match(code, /useLoadingScope\(loading\)/, "StepList reads the internal LoadingScope");
  assert.match(
    code,
    /const LOADING_STEP_KEYS = \["loading-1", "loading-2", "loading-3"\] as const;/,
    "exactly 3 frozen dummy cards when no steps are known",
  );
  assert.match(code, /borderColor="transparent"/, "skeleton card borders are transparent");
  assert.match(code, /accessibilityState: \{ busy: true \}/, "the loading region is marked busy");
});
