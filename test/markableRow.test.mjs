/**
 * Contract test for MarkableRow (spudly/design-system#119,
 * recipes-detail tranche): the markable hairline row extracted
 * from RecipeDetailPage's ingredient rows (PublicRecipePage's
 * identical rows adopt it with that page's tranche).
 *
 * The pins hold the row's distinguishing semantics: a marked
 * row renders dimmed but STAYS pressable (the mark toggles —
 * it is not a disabled state), the press form follows the
 * ListRow keyboard pattern, and without a callback the row is
 * a plain row with no activation.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "MarkableRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MarkableRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.MarkableRow, "function", "MarkableRow must be exported from @spudly/ui");
});

test("a marked row dims but keeps its press — the mark is a toggle, not a disable", () => {
  assert.match(code, /opacity=\{isMarked \? 0\.4 : 1\}/, "the marked treatment is the dim");
  assert.match(
    code,
    /accessibilityRole: "button"/,
    "the press form carries the button role regardless of the mark",
  );
  assert.ok(!code.includes("accessibilityState"), "a marked row is never announced disabled");
});

test("the press form is keyboard-operable on web (the ListRow pattern)", () => {
  assert.match(code, /tabIndex: 0,/);
  assert.match(code, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(code, /onPress\?\.\(\)/, "the button keys invoke the same callback as a press");
});

test("the trailing note renders only when provided", () => {
  assert.match(code, /\{trailingNote \? \(/);
});
