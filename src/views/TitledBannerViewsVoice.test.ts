/**
 * Voice-slot pins for the remaining titled and banner views
 * (#539 tranche 2e): ChangedListBanner's Revert action,
 * ConsentBannerView's accept / decline defaults,
 * InstallBannerView's dismiss default, and
 * RecipeExportPickerView's search-placeholder, empty-message,
 * and export-pending defaults come from the app-supplied voice
 * object — the DS ships no default strings. Caller-passed props
 * still win over the voice defaults. ConfirmActionView,
 * LegalSection, CatalogHeader, and AppTopBar are pinned as the
 * exceptions: their titles, labels, and messages are all
 * caller-supplied data with no hard-coded defaults, so they read
 * no voice slots.
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

test("ChangedListBanner reads its Revert action from the voice object", () => {
  const view = read("ChangedListBanner");
  assert.match(view, /useVoice\(\)/);
  assert.match(view, /voice\.changedListBanner\.revertLabel/, "slot revertLabel is read");
  assert.doesNotMatch(view, /"Revert"|>\s*Revert\s*</);
});

test("ConsentBannerView reads its defaults from the voice object", () => {
  const view = read("ConsentBannerView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["acceptLabel", "declineLabel"]) {
    assert.match(view, new RegExp(`voice\\.consentBannerView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(view, /"Accept"|"Decline"/);
});

test("InstallBannerView reads its dismiss default from the voice object", () => {
  const view = read("InstallBannerView");
  assert.match(view, /useVoice\(\)/);
  assert.match(view, /voice\.installBannerView\.dismissLabel/, "slot dismissLabel is read");
  assert.doesNotMatch(view, /"Dismiss install banner"/);
});

test("RecipeExportPickerView reads its defaults from the voice object", () => {
  const view = read("RecipeExportPickerView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["searchPlaceholder", "emptyMessage", "exportPendingLabel"]) {
    assert.match(
      view,
      new RegExp(`voice\\.recipeExportPickerView\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  assert.doesNotMatch(view, /"Search recipes…"|"No recipes to export yet\."|"Exporting…"/);
});

test("ConfirmActionView reads no voice slots — its title and labels are caller-supplied", () => {
  const view = read("ConfirmActionView");
  assert.doesNotMatch(view, /useVoice/);
  assert.match(view, /title: string/);
  assert.match(view, /confirmLabel: string/);
});

test("LegalSection reads no voice slots — its title is caller-supplied", () => {
  const view = read("LegalSection");
  assert.doesNotMatch(view, /useVoice/);
  assert.match(view, /title: string/);
});

test("CatalogHeader reads no voice slots — its title is caller-supplied", () => {
  const view = read("CatalogHeader");
  assert.doesNotMatch(view, /useVoice/);
  assert.match(view, /title: string/);
});

test("AppTopBar reads no voice slots — its brand, nav, and actions are caller-supplied", () => {
  const view = read("AppTopBar");
  assert.doesNotMatch(view, /useVoice/);
  assert.match(view, /brand: AppTopBarBrand/);
  assert.match(view, /navItems\?: AppTopBarNavItem\[\]/);
  assert.match(view, /actions\?: AppTopBarAction\[\]/);
});
