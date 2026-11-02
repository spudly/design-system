/**
 * Contract test for Dialog focus containment with no focusable
 * content (spudly/design-system#391).
 *
 * The primitive's focus scope wraps Tab between the dialog's
 * focusable descendants, but a dialog with none (the WithoutActions
 * story: text only) left sequential navigation free to escape to
 * the opener behind the overlay — forward Tab reached it on every
 * second press, and a first Shift+Tab landed on it directly
 * (Manual Storybook QA on PR #386, verified pre-existing on heads
 * d2abcf5 and a385b68). The pins hold the fix in the Dialog
 * component itself: while open on web, a capture-phase keydown
 * listener swallows Tab only when the content holds no focusable
 * element, and pulls outside focus back onto the scope's landing
 * wrapper inside the dialog.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "Dialog.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Dialog is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Dialog, "function", "Dialog must be exported from @spudly/ui");
});

test("an open web dialog registers a capture-phase Tab containment listener (#391)", () => {
  assert.match(code, /document\.addEventListener\("keydown", handleTabContainment, true\);/);
  assert.match(code, /document\.removeEventListener\("keydown", handleTabContainment, true\);/);
  assert.match(code, /if \(!open \|\| !isWeb \|\| typeof document === "undefined"\) \{/);
  assert.match(code, /if \(event\.key !== "Tab"\) \{/);
  assert.match(code, /\}, \[open\]\);/);
});

test("Tab is swallowed only when the dialog content holds no focusable element (#391)", () => {
  assert.match(code, /content\.querySelectorAll\(/);
  assert.match(code, /button:not\(\[disabled\]\)/);
  assert.match(code, /if \(focusable\.length > 0\) \{\s+return;\s+\}/);
  assert.match(code, /event\.preventDefault\(\);\s+event\.stopPropagation\(\);/);
});

test("focus outside the dialog is pulled back onto the landing wrapper inside it (#391)", () => {
  assert.match(code, /content\.closest\("dialog"\)/);
  assert.match(code, /frame\.querySelector\('\[tabindex="-1"\]'\)/);
  assert.match(code, /landing\.focus\(\)/);
});
