/**
 * Contract test for EqualButtonRow (spudly/design-system#119,
 * extracted for PublicRecipePage's adoption round): the
 * call-to-action bar whose buttons share the row's width
 * equally — flex 1 with a 40% minimum width, wrapping instead
 * of shrinking.
 *
 * PublicRecipePage's CTA bar hand-rolled this sizing in the
 * page (a raw XStack plus cloneElement flex/minWidth sizing on
 * each button) — styling a page may not apply itself under
 * #119 — so the bar is a component here and the page adopts it.
 * ButtonRow is the sibling treatment (same 12px gap and wrap,
 * natural button widths); Button's `grow` supplies flex: 1 but
 * no 40% floor, so neither existing piece renders this bar.
 *
 * The pins hold the treatment's identity: the row owns the
 * 12px gap and the wrap (both omitted from the public props),
 * and the row — never the caller — sizes the buttons.
 *
 * Source scan plus a dist export check, like the other
 * component contract tests. The dist import needs the
 * harness's react-native-svg stub registered first, so this
 * file imports registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "EqualButtonRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("EqualButtonRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.EqualButtonRow,
    "function",
    "EqualButtonRow must be exported from @spudly/ui",
  );
});

test("EqualButtonRowProps is a type-only export from the built components barrel", () => {
  const barrel = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(barrel, /export \{[^}]*type EqualButtonRowProps[^}]*\}/);
});

test("the row owns the 12px gap and the wrap; neither is a caller prop", () => {
  assert.match(code, /name: "EqualButtonRow"/);
  assert.match(code, /gap: tokens\.spacing\[3\]/);
  assert.match(code, /flexWrap: "wrap"/);
  assert.match(code, /Omit<StyledEqualButtonRowProps, "gap" \| "flexWrap">/);
  assert.ok(!/interface\s/.test(code), "type aliases only");
});

test("the row sizes its buttons itself: flex 1 with the 40% floor", () => {
  assert.match(code, /EQUAL_BUTTON_MIN_WIDTH = "40%"/);
  assert.match(code, /cloneElement\(/);
  assert.match(code, /flex: 1,\s+minWidth: EQUAL_BUTTON_MIN_WIDTH/);
});
