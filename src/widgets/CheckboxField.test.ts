/**
 * Contract test for the unified CheckboxField (#713): CheckRow
 * was retired into this field, so this file ports CheckRow's
 * pins (src/widgets/CheckRow.test.ts, deleted with the widget)
 * to the list shape — the inline detail segment, the hairline,
 * the whole-row press target, the accessible-name composition
 * with detail, and the opt-in strikethrough — and pins the
 * shared box's visual-direction treatment: unfilled in both
 * states, a $primary outline in both states, and a $primary
 * check glyph, with the box aligned to the label's first line
 * by a first-line-height container instead of CheckRow's
 * hand-tuned paddingTop={2} nudge.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "CheckboxField.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CheckboxField is exported from the built internal components barrel; CheckRow is retired", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.CheckboxField,
    "function",
    "CheckboxField must be exported from the internal components barrel",
  );
  assert.equal(dist.CheckRow, undefined, "CheckRow must no longer be exported (#713)");
});

test("the box is unfilled in both states with a $primary outline and a $primary glyph (#713)", () => {
  assert.match(code, /<StyledBox borderColor="\$primary" backgroundColor="\$surface">/);
  assert.match(code, /color: "\$primary",\s+fontSize: tokens\.typography\.fontSize\.sm,/);
  assert.ok(!code.includes("$onPrimary"), "the glyph is no longer white on a filled box");
  assert.ok(
    !/checked \? "\$primary" : "\$textMuted"/.test(code),
    "the outline no longer changes color between states",
  );
  assert.ok(!/backgroundColor=\{checked/.test(code), "the box no longer fills when checked");
});

test("the list shape's accessible name composes the detail after the label (the row family's rule)", () => {
  assert.match(code, /const accessibleName = detail \? `\$\{label\}, \$\{detail\}` : label;/);
  assert.match(code, /"aria-label": accessibilityLabel \?\? accessibleName/);
});

test("the detail renders as one muted segment after the middle-dot separator", () => {
  assert.match(code, /\{detail \? \(/);
  assert.match(code, /· \{detail\}/);
  assert.ok(
    code.indexOf("{label}") < code.indexOf("· {detail}"),
    "the detail segment must follow the label in the row's text line",
  );
});

test("strikethrough is opt-in via strikeWhenChecked (option A); the default does not strike", () => {
  assert.match(code, /const struck = checked && strikeWhenChecked;/);
  assert.match(code, /textDecorationLine=\{struck \? "line-through" : "none"\}/);
  // The nested label carries its own mute: Text's base style
  // sets its color explicitly, so it does not inherit the
  // outer Text's conditional color.
  assert.match(
    code,
    /fontWeight=\{tokens\.typography\.fontWeight\.medium\}\s+\{\.\.\.\(struck \? \{ color: "\$textMuted" \} : \{\}\)\}/,
  );
});

test("the whole row is the press target in the list shape; the checkbox stays the single a11y stop", () => {
  assert.match(code, /onPress=\{disabled \? undefined : toggle\}/);
  assert.match(
    code,
    /const listShape = detail !== undefined \|\| separator \|\| strikeWhenChecked;/,
  );
});

test("the separator renders the hairline in the list shape", () => {
  assert.match(code, /borderBottomWidth: 1, borderBottomColor: tokens\.colors\.gray\.gray2/);
});

test("the box aligns to the label's first line via a first-line-height container, no padding nudge", () => {
  assert.match(
    code,
    /const FIRST_LINE_HEIGHT = tokens\.typography\.fontSize\.md \* tokens\.typography\.lineHeight\.normal;/,
  );
  // The container is shortened by twice the measured ~4px
  // line-box/ink-center offset so the centered box lands on the
  // first line's glyph center, not the line box's center (#713
  // fix round).
  assert.match(code, /const FIRST_LINE_BOX_CONTAINER_HEIGHT = FIRST_LINE_HEIGHT - 8;/);
  assert.match(
    code,
    /<XStack\s+height=\{FIRST_LINE_BOX_CONTAINER_HEIGHT\}\s+alignItems="center"\s+justifyContent="center"\s+>/,
  );
  assert.ok(!/paddingTop/.test(code), "no hand-tuned paddingTop offset (#713)");
  assert.ok(!/margin/.test(code), "CheckboxField must not carry margins (#119)");
});
