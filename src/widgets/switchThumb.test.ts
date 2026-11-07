/**
 * Contract test for spudly/design-system#484: in the On state the Switch
 * knob must sit on the right of the track, and toggling must animate the
 * knob's travel. Tamagui's runtime-measured travel is not applied with
 * this repo's custom styled frame (its dynamic size machinery resolves
 * to nothing against the numeric spacing-token scale), so StyledThumb
 * drives its horizontal offset from the switch state itself and
 * transitions it with the shared "fast" spring.
 *
 * Source scan (same rationale as switchStories.test.ts).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const source = readFileSync(join(root, "src", "widgets", "Switch.tsx"), "utf8");
const thumb = source.slice(
  source.indexOf("const StyledThumb"),
  source.indexOf("export type SwitchProps"),
);

test("StyledThumb carries an on variant with the 20px travel offset (#484)", () => {
  assert.match(thumb, /on:\s*\{\s*true:\s*\{[^}]*x: 20/s, "on:true must offset the thumb 20px");
  assert.match(thumb, /false:\s*\{\s*x: 0,?\s*\}/s, "on:false must leave the thumb at offset 0");
});

test("Switch passes its checked state to the thumb and transitions the travel (#484)", () => {
  assert.match(
    source,
    /<StyledThumb on=\{checked\} transition="fast" \/>/,
    "the thumb's on variant must be keyed off checked and animated with transition=\"fast\"",
  );
  assert.doesNotMatch(source, /animation=/, "the animation prop never visibly animates in this repo (#457)");
});
