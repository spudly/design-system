/**
 * Voice-slot pins for the remaining widget literals (#539 tranche 1f):
 * AutocompletePicker's search defaults and announcements, Alert's and
 * FixedActionBanner's dismiss labels, BulkSelectToolbar's search
 * placeholder and selection count, and the form-field fallbacks
 * (CheckboxSelectList, SelectField, ColorPickerField, StarRatingInput,
 * RemovableField) come from the app-supplied voice object — the DS
 * ships no default strings.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const read = (name: string) => strip(readFileSync(join(here, `${name}.tsx`), "utf8"));

test("AutocompletePicker reads its search defaults and announcements from the voice object", () => {
  const picker = read("AutocompletePicker");
  assert.match(picker, /useVoice\(\)/);
  for (const slot of [
    "searchPlaceholder",
    "searchLabel",
    "searchingLabel",
    "noResultsMessage",
    "resultsAvailableLabel",
    "removeLabel",
    "removeItemLabel",
  ]) {
    assert.match(picker, new RegExp(`voice\\.autocompletePicker\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(picker, /"Search…"|"No results found\."|"Searching"/);
  assert.doesNotMatch(picker, /`Remove \$\{item\.label\}`/);
});

test("Alert and FixedActionBanner read their dismiss labels from the voice object", () => {
  const alert = read("Alert");
  assert.match(alert, /voice\.alert\.dismissLabel/);
  assert.doesNotMatch(alert, /accessibilityLabel="Dismiss"/);
  const banner = read("FixedActionBanner");
  assert.match(banner, /voice\.fixedActionBanner\.dismissLabel/);
  assert.doesNotMatch(banner, /dismissAriaLabel = "Dismiss"/);
  assert.doesNotMatch(banner, />\s*Dismiss\s*</);
});

test("BulkSelectToolbar reads its search placeholder and selection count from the voice object", () => {
  const toolbar = read("BulkSelectToolbar");
  assert.match(toolbar, /voice\.bulkSelectToolbar\.searchPlaceholder/);
  assert.match(toolbar, /voice\.bulkSelectToolbar\.selectedLabel\(selectedCount\)/);
  assert.doesNotMatch(toolbar, /searchPlaceholder = "Search…"/);
  assert.doesNotMatch(toolbar, /`\$\\{selectedCount\} selected`/);
});

test("form-field fallbacks read from the voice object", () => {
  const list = read("CheckboxSelectList");
  assert.match(list, /voice\.checkboxSelectList\.emptyMessage/);
  assert.doesNotMatch(list, /emptyMessage = "No items found\."/);

  const select = read("SelectField");
  assert.match(select, /voice\.selectField\.placeholder/);
  assert.match(select, /voice\.selectField\.selectOptionLabel/);
  assert.doesNotMatch(select, /placeholder = "Select…"|"Select an option"/);

  const color = read("ColorPickerField");
  assert.match(color, /voice\.colorPickerField\.chooseColorLabel/);
  assert.match(color, /voice\.colorPickerField\.selectColorLabel\(color\)/);
  assert.doesNotMatch(color, /"Choose a color"|`Select color \$\{color\}`/);

  const stars = read("StarRatingInput");
  assert.match(stars, /voice\.starRatingInput\.label/);
  assert.match(stars, /voice\.starRatingInput\.ratedLabel\(value\)/);
  assert.match(stars, /voice\.starRatingInput\.rateLabel\(star\)/);
  assert.doesNotMatch(stars, /"Star rating"|`Rated \$\{value\} out of 5 stars`|`Rate \$\{star\} out of 5 stars`/);

  const removable = read("RemovableField");
  assert.match(removable, /voice\.removableField\.removeLabel/);
  assert.doesNotMatch(removable, />\s*Remove\s*</);
});
