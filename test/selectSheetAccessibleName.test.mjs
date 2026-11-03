/**
 * Contract test for the SelectField touch sheet's accessible name
 * (Copilot review on PR #389).
 *
 * The Tamagui 3.1.9 bump makes modal web sheets announce as
 * dialogs; SelectField's touch-adapted Sheet rendered without any
 * accessible name, so a screen reader met an unnamed dialog. The
 * pin holds the fix in the component: the Sheet carries the
 * field's label, with a fixed fallback when the field has no
 * label. Source-contract pattern follows test/textFontContext.test.mjs.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "SelectField.tsx"), "utf8");

test("the touch Sheet carries the field label as its accessible name, with a fallback", () => {
  assert.match(
    source,
    /<Sheet\s+modal\s+dismissOnSnapToBottom\s+aria-label=\{label\?\.trim\(\) \? label : "Select an option"\}/,
  );
});
