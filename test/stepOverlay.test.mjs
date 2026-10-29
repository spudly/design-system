/**
 * Contract test for StepOverlay (spudly/design-system#119, the
 * meals & planning tranche): the full-screen step-reader shell
 * extracted from MealCookingModePage — a dark absolute-fill
 * shell, a translucent Done pill pinned top-right, eyebrow
 * lines over the step body at reading size, and the caller's
 * step navigation below.
 *
 * The pins hold the shell's treatment: the Done pill carries
 * the button semantics through the platform translator (#237)
 * with web keyboard activation, its fill is a layered-opacity
 * surface (the page's recorded deviation: theme-correct alpha
 * instead of hex-alpha suffixes), the eyebrows are the
 * uppercased 60%-opacity lines, and the body sets no
 * font-size-derived lineHeight (the #162 ban).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "StepOverlay.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("StepOverlay is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.StepOverlay, "function", "StepOverlay must be exported from @spudly/ui");
});

test("the shell fills its positioned ancestor on the dark step-10 surface", () => {
  assert.match(code, /position="absolute"/);
  assert.match(code, /backgroundColor=\{tokens\.colors\.gray\.gray10\}/);
  assert.match(code, /justifyContent="center"/);
  assert.match(code, /paddingHorizontal="\$6"/);
});

test("the Done pill routes its button semantics through the translator (#237)", () => {
  assert.match(
    code,
    /\{\.\.\.platformAccessibilityProps\(\{\s+accessibilityRole: "button",\s+accessibilityLabel: doneLabel,\s+\}\)\}/,
  );
  assert.match(code, /onPress=\{onDone\}/);
  assert.match(code, /tabIndex=\{0\}/);
  assert.match(code, /opacity=\{0\.1\}/);
  assert.match(code, /if \(!event\.repeat\) \{\s+onDone\(\);\s+\}/);
});

test("the header treatment: uppercased eyebrows at 60% over the body at reading size", () => {
  assert.equal((code.match(/textTransform="uppercase"/g) ?? []).length, 2);
  assert.equal((code.match(/opacity=\{0\.6\}/g) ?? []).length, 2);
  assert.match(code, /fontSize=\{tokens\.typography\.fontSize\["2xl"\]\}/);
  assert.ok(!code.includes("lineHeight"), "no lineHeight — the #162 ban");
});
