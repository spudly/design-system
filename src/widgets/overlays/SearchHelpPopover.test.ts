/**
 * Contract tests for SearchHelpPopover (spudly/design-system#699).
 *
 * The contracts pinned here:
 * 1. SearchHelpPopover is exported from the internal components barrel (dist).
 * 2. The trigger is a Button carrying the help glyph through
 *    Button's icon slot (`icon="help"`) plus the host-supplied
 *    label — never a hand-rolled pressable or a raw icon import.
 * 3. The panel is a Tamagui Popover that adapts to a Sheet on
 *    touch (the SelectField Adapt pattern), like Dropdown.
 * 4. Content is host-supplied DATA only: title, optional intro,
 *    and entries of {syntax, description}; the widget source
 *    bakes in no single app's search language (no qualifier
 *    names as literals in the component code).
 * 5. Syntax tokens get the mono treatment; entries render as a
 *    definition-style list keyed by syntax.
 * 6. DS hard rules: type aliases only, no margins for spacing.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const dist: Record<string, any> = await import("../../dist/widgets/index.js");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const widget = codeOf("src/widgets/overlays/SearchHelpPopover.tsx");

test("SearchHelpPopover is exported from the internal components barrel", () => {
  assert.equal(typeof dist.SearchHelpPopover, "function");
});

test("the trigger is a Button with the help icon slot and the host label", () => {
  assert.match(widget, /icon="help"/);
  assert.match(widget, /<Button/);
  assert.match(widget, /aria-expanded=\{open\}/);
});

test("the panel is a Popover adapting to a touch Sheet", () => {
  assert.match(widget, /<Popover/);
  assert.match(widget, /<Adapt platform="touch">/);
  assert.match(widget, /<Sheet/);
});

test("content is data props: title, optional intro, syntax/description entries", () => {
  assert.match(widget, /export type SearchHelpEntry = \{/);
  assert.match(widget, /syntax: string;/);
  assert.match(widget, /description: string;/);
  assert.match(widget, /intro\?: string;/);
  assert.match(widget, /entries: SearchHelpEntry\[\];/);
  for (const baked of ["title:", "ingredient:", "calories:"]) {
    assert.ok(!widget.includes(`"${baked}`), `widget must not bake in "${baked}"`);
  }
});

test("syntax tokens render in the mono treatment", () => {
  assert.match(widget, /fontFamily=\{tokens\.typography\.fontFamily\.mono\}/);
});

test("type aliases only and no margin spacing", () => {
  assert.ok(!/\binterface\b/.test(widget));
  assert.ok(!/margin(Top|Bottom|Left|Right)?=/.test(widget));
});
