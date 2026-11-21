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
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "MarkableRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

// Since #587 phase 3 the keyboard-activation handler lives in the
// shared keyboardActivation block the pressable rows compose; the
// keyboard pins below read that source, and MarkableRow's own pins
// hold that it delegates to the block.
const keyboardActivationSource = readFileSync(
  join(here, "../..", "src", "widgets", "keyboardActivation.ts"),
  "utf8",
);
const keyboardActivationCode = keyboardActivationSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MarkableRow is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.MarkableRow,
    "function",
    "MarkableRow must be exported from the internal components barrel",
  );
});

test("a pressable row leads with the visual-direction checkbox box (#721, #713 design)", () => {
  assert.match(
    code,
    /borderColor="\$primary"/,
    "the box takes the #713 CheckboxField shape: a $primary (terracotta) outline in both states",
  );
  assert.match(code, /backgroundColor="\$surface"/, "the box is unfilled in both states");
  assert.match(
    code,
    /\{isMarked \? \(\s+<Text fontSize=\{tokens\.typography\.fontSize\.sm\} color="\$primary">\s+✓\s+<\/Text>\s+\) : null\}/,
    "the check glyph renders in the same terracotta while marked",
  );
});

test("a marked row never dims but keeps its press — the mark is a toggle, not a disable", () => {
  assert.ok(!code.includes("opacity={isMarked"), "the row text never dims (#721 fidelity round)");
  assert.match(
    code,
    /accessibilityRole: "checkbox"/,
    "the press form carries the checkbox role — the box it draws (#721)",
  );
  assert.match(
    code,
    /accessibilityState: \{ checked: isMarked \}/,
    "the marked state is announced through the checked state, never as disabled",
  );
});

test("the press form is keyboard-operable on web (the ListRow pattern)", () => {
  assert.match(code, /tabIndex: 0,/);
  assert.match(
    code,
    /const handleKeyDown = keyboardActivationHandler\(\(\) => onPress\?\.\(\)\);/,
    "MarkableRow delegates keyboard activation to the shared handler (#587 phase 3)",
  );
  assert.match(code, /onKeyDown: handleKeyDown,/);
  assert.match(
    keyboardActivationCode,
    /event\.key === "Enter" \|\| event\.key === " "/,
    "the shared handler activates on Enter and Space",
  );
  assert.match(code, /onPress\?\.\(\)/, "the button keys invoke the same callback as a press");
  // A held key must not re-activate (the native-button guard): a
  // repeat would flip the mark back and forth until release.
  assert.match(keyboardActivationCode, /repeat\?: boolean;/);
  assert.match(keyboardActivationCode, /if \(!event\.repeat\) \{\s*onActivate\(\);/);
});

test("the trailing note renders only when provided", () => {
  assert.match(code, /\{trailingNote \? \(/);
});

test("the subtitle renders only when provided, as hint text under the label (#440)", () => {
  assert.match(code, /\{subtitle \? \(/);
  assert.match(code, /<Text variant="hint">\{subtitle\}<\/Text>/);
});
