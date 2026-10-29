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
 * ListRow keyboard pattern.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "StepList.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("StepList is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.StepList, "function", "StepList must be exported from @spudly/ui");
});

test("the list owns the active step, first step active by default", () => {
  assert.match(code, /const \[activeIndex, setActiveIndex\] = useState\(0\);/);
  assert.match(code, /const isActive = i === activeIndex;/);
  assert.match(
    code,
    /borderColor=\{isActive \? "\$primary" : tokens\.colors\.gray\.gray2\}/,
    "the active card takes the primary treatment",
  );
  assert.match(
    code,
    /aria-pressed=\{isActive\}/,
    "the active step is exposed as a pressed toggle (aria-selected is invalid on a button role)",
  );
});

test("step activation is keyboard-operable on web (the ListRow pattern)", () => {
  assert.match(code, /tabIndex=\{0\}/);
  assert.match(code, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(code, /setActiveIndex\(i\)/, "keys and presses activate the same step");
});
