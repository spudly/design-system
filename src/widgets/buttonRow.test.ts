/**
 * Contract test for ButtonRow (spudly/design-system#119,
 * extracted for PublicRecipePage's adoption round): the
 * call-to-action bar whose buttons share the row's width
 * equally — flex 1 with a 40% minimum width, wrapping instead
 * of shrinking. EqualButtonRow carried that treatment until
 * #475 merged it into ButtonRow as the `equal` prop.
 *
 * PublicRecipePage's CTA bar hand-rolled this sizing in the
 * page (a raw XStack plus cloneElement flex/minWidth sizing on
 * each button) — styling a page may not apply itself under
 * #119 — so the bar is a component here and the page adopts it.
 * Button's `grow` supplies flex: 1 but no 40% floor, so the
 * row's own `equal` treatment is what renders this bar.
 *
 * The pins hold the treatment's identity: the row owns the
 * 12px gap and the wrap (both omitted from the public props),
 * and the row — never the caller — sizes the buttons.
 *
 * Source scan plus a dist export check, like the other
 * component contract tests. The dist import needs the
 * harness's react-native-svg stub registered first, so this
 * file imports registerSvgStub.ts before anything else.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "ButtonRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ButtonRow is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.ButtonRow,
    "function",
    "ButtonRow must be exported from the internal components barrel",
  );
  assert.equal(
    typeof dist.EqualButtonRow,
    "undefined",
    "EqualButtonRow is gone: #475 merged it into ButtonRow",
  );
});

test("ButtonRowProps is a type-only export from the built components barrel", () => {
  const barrel = readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(barrel, /export \{[^}]*type ButtonRowProps[^}]*\}/);
  assert.ok(!barrel.includes("EqualButtonRow"), "the barrel no longer names EqualButtonRow");
});

test("the row owns the 12px gap and the wrap; neither is a caller prop", () => {
  assert.match(code, /name: "ButtonRow"/);
  assert.match(code, /gap: tokens\.spacing\[3\]/);
  assert.match(code, /flexWrap: "wrap"/);
  assert.match(code, /Omit<StyledButtonRowProps, "gap" \| "alignItems" \| "flexWrap">/);
  assert.ok(!/interface\s/.test(code), "type aliases only");
});

test("the equal row sizes its buttons itself: flex 1 with the 40% floor", () => {
  assert.match(code, /equal\?: boolean/);
  assert.match(code, /EQUAL_BUTTON_MIN_WIDTH = "40%"/);
  assert.match(code, /cloneElement\(/);
  assert.match(code, /flex: 1,\s+minWidth: EQUAL_BUTTON_MIN_WIDTH/);
});

test("elements lifted out of a fragment are re-keyed under the fragment's scope", () => {
  // Two fragments may each hold a child keyed the same; the
  // flattened list must not carry duplicate keys.
  assert.match(code, /cloneElement\(inner as ReactElement, \{\s+key: `\$\{scope\}:/);
});
