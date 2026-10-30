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
 *
 * #332 adds two contract pins: the body and the caller's
 * navigation sit in a bounded scroll region whose content
 * container grows to the region's height (so short bodies keep
 * the vertically centered treatment while long bodies scroll
 * instead of clipping, with the Done pill a fixed sibling
 * outside the region), and the shell manages focus — dialog
 * semantics through the platform split (dialogRoleProps) and a
 * web mount focus move into the shell.
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
});

test("the body and navigation scroll in a bounded region; short bodies stay centered (#332)", () => {
  // The region is a ScrollView the shell bounds with flex, its
  // content container grows to the region's height, and the
  // column inside keeps the centered treatment and the shell's
  // former horizontal inset.
  assert.match(code, /<ScrollView\s+flex=\{1\}/);
  assert.match(code, /keyboardShouldPersistTaps="handled"/);
  assert.match(code, /contentContainerStyle=\{scrollContentContainerStyle\}/);
  assert.match(
    code,
    /const scrollContentContainerStyle = \{ flexGrow: 1, justifyContent: "center" \} as const;/,
  );
  assert.match(code, /<YStack paddingHorizontal="\$6" paddingVertical="\$12">/);
  assert.match(code, /paddingHorizontal="\$6"/);
  // The Done pill is NOT inside the scroll region: it renders
  // after the region closes, a fixed sibling of it, so it stays
  // pinned and reachable at any scroll position.
  const regionEnd = code.indexOf("</ScrollView>");
  const pill = code.indexOf('accessibilityRole: "button"');
  assert.ok(
    regionEnd !== -1 && pill > regionEnd,
    "the Done pill renders outside the scroll region",
  );
  // The pill's fill is opaque to content scrolling beneath it:
  // the pill paints the shell's own color as the base under
  // its layered 10% surface, so the composite over the shell
  // is unchanged but scrolled text cannot show through (#332)
  // — the gray-10 paint appears twice, shell and pill.
  assert.equal((code.match(/backgroundColor=\{tokens\.colors\.gray\.gray10\}/g) ?? []).length, 2);
});

test("the shell manages focus: dialog semantics and a web mount focus move (#332)", () => {
  // Dialog semantics go through the platform split — `dialog`
  // is an ARIA-only role (no RN accessibilityRole member), so
  // the shell spreads dialogRoleProps and never passes the
  // literal as an accessibilityRole.
  assert.match(code, /\{\.\.\.dialogRoleProps\}/);
  assert.ok(!code.includes('accessibilityRole: "dialog"'), "dialog never routes as an RN role");
  // The dialog is named for its title, through the translator.
  assert.match(code, /\{\.\.\.platformAccessibilityProps\(\{ accessibilityLabel: title \}\)\}/);
  // The shell is the focus target: focusable but never a tab
  // stop, and the mount effect moves web focus into it once.
  assert.match(code, /tabIndex=\{-1\}/);
  assert.match(code, /useEffect\(\(\) => \{\s+if \(!isWeb\) \{\s+return;\s+\}/);
  assert.match(code, /node\?\.focus\?\.\(\)/);
  assert.match(code, /\}, \[\]\);/);
  // On unmount, focus returns to the element that held it
  // before the overlay opened, when it is still in the tree.
  assert.match(code, /const previouslyFocused = document\.activeElement as HTMLElement \| null;/);
  assert.match(code, /document\.contains\(previouslyFocused\)/);
  assert.match(code, /previouslyFocused\.focus\(\)/);
  // Focus containment: the shell's keydown handler wraps Tab
  // and Shift+Tab at the overlay's first and last focusable
  // controls, so keyboard focus cannot escape into the
  // covered content behind the overlay.
  assert.match(code, /onKeyDown=\{handleShellKeyDown\}/);
  assert.match(code, /event\.key !== "Tab"/);
  assert.match(code, /last\.focus\(\)/);
  assert.match(code, /first\.focus\(\)/);
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
