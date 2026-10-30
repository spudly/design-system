/**
 * Contract test for CheckRow (spudly/design-system#119, the
 * meals & planning tranche): the check-off row extracted from
 * ShoppingListPage — a drawn box and a rich text line (bold
 * label, muted detail segments inline) over a hairline, the
 * whole row carrying the checkbox semantics.
 *
 * The pins hold what the page's contract (test/mealPages.test.mjs)
 * used to pin in the page source: the checkbox role, checked
 * state, and label route together through the platform
 * translator (#237), checked rows render struck through and
 * muted, the detail joins the label with the middle-dot
 * separator, and web keyboard activation (Enter / Space)
 * invokes the same callback as a press.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "CheckRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CheckRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.CheckRow, "function", "CheckRow must be exported from @spudly/ui");
});

test("the row carries checkbox semantics through the translator, never raw RN props (#237)", () => {
  assert.match(
    code,
    /\{\.\.\.platformAccessibilityProps\(\{\s+accessibilityRole: "checkbox",\s+accessibilityState: \{ checked \},\s+accessibilityLabel: accessibleName,\s+\}\)\}/,
  );
  assert.ok(
    !/accessibility(Label|State|Role|Value)=/.test(code),
    "no raw RN accessibility JSX props — the translator owns the web mapping",
  );
});

test("the accessible name composes the detail after the label (the row family's rule)", () => {
  assert.match(code, /const accessibleName = detail \? `\$\{label\}, \$\{detail\}` : label;/);
});

test("a held activation key does not re-toggle: repeats are ignored", () => {
  assert.match(code, /if \(!event\.repeat\) \{\s+onToggle\(\);\s+\}/);
});

test("checked rows render struck through and muted; the box fills with the check glyph", () => {
  assert.match(code, /textDecorationLine=\{checked \? "line-through" : "none"\}/);
  assert.match(code, /backgroundColor=\{checked \? "\$primary" : "\$surface"\}/);
  assert.match(code, /✓/);
  // The nested label carries its own mute: Text's base style
  // sets its color explicitly, so it does not inherit the
  // outer Text's conditional color.
  assert.match(
    code,
    /fontWeight=\{tokens\.typography\.fontWeight\.medium\}\s+\{\.\.\.\(checked \? \{ color: "\$textMuted" \} : \{\}\)\}/,
  );
});

test("the detail renders as one muted segment after the middle-dot separator", () => {
  assert.match(code, /\{detail \? \(/);
  assert.match(code, /· \{detail\}/);
  assert.ok(
    code.indexOf("{label}") < code.indexOf("· {detail}"),
    "the detail segment must follow the label in the row's text line",
  );
});

test("the row is the press target with web keyboard activation", () => {
  assert.match(code, /onPress=\{onToggle\}/);
  assert.match(code, /tabIndex=\{0\}/);
  assert.match(code, /event\.key === "Enter" \|\| event\.key === " "/);
});

test("the row owns its hairline and padding; no separation of its own beyond the list's", () => {
  assert.match(code, /borderBottomColor=\{tokens\.colors\.gray\.gray2\}/);
  assert.match(code, /paddingVertical="\$3"/);
  assert.ok(!/margin/.test(code), "CheckRow must not carry margins (#119)");
});
