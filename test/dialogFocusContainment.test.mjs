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

test("Tab is swallowed only when the dialog content holds no effectively tabbable element (#391)", () => {
  // Effective tabbability, not selector shape (Copilot + CodeRabbit
  // review on PR #392): hidden inputs, disabled controls,
  // negative-tabindex-only controls, and unrendered elements are
  // not Tab stops; summary and contenteditable elements are.
  assert.match(code, /content\.querySelectorAll\(/);
  assert.match(code, /a\[href\], area\[href\], button/);
  assert.match(code, /summary, iframe, audio\[controls\], video\[controls\]/);
  // Effective state beyond the element itself (Copilot +
  // CodeRabbit review on PR #392): inert ancestors remove Tab
  // stops; the :disabled pseudo-class carries fieldset semantics
  // (and never matches links, which a fieldset cannot disable);
  // an image-map area is a stop only when the image using its
  // map is rendered, and only after the negative-tabindex check.
  assert.match(code, /candidate\.closest\("\[inert\]"\)/);
  assert.match(code, /candidate\.matches\(":disabled"\)/);
  assert.doesNotMatch(code, /fieldset\[disabled\]/);
  assert.match(code, /candidate instanceof HTMLAreaElement/);
  assert.match(code, /img\[usemap=/);
  const areaIndex = code.indexOf("candidate instanceof HTMLAreaElement");
  const tabStopIndex = code.indexOf('candidate.getAttribute("tabindex")');
  assert.ok(
    tabStopIndex !== -1 && areaIndex !== -1 && tabStopIndex < areaIndex,
    "the negative-tabindex check must precede the image-map area exception",
  );
  assert.match(code, /\[contenteditable=""\], \[contenteditable="true"\]/);
  assert.doesNotMatch(code, /\[contenteditable\],/);
  assert.match(code, /candidate\.hasAttribute\("disabled"\)/);
  assert.match(code, /candidate\.type === "hidden"/);
  assert.match(code, /candidate\.getAttribute\("tabindex"\)/);
  assert.match(code, /Number\.parseInt\(tabStopAttr, 10\) < 0/);
  assert.match(code, /style\.visibility === "hidden"/);
  assert.match(code, /candidate\.getClientRects\(\)\.length > 0/);
  assert.match(code, /if \(hasTabbable\) \{\s+return;\s+\}/);
  assert.match(code, /event\.preventDefault\(\);\s+event\.stopPropagation\(\);/);
});

test("only the topmost modal intercepts Tab — a covered dialog stands down (#391)", () => {
  // Stacked dialogs: a text-only dialog left open beneath a newer
  // modal must not swallow Tab for the dialog above it (Copilot +
  // CodeRabbit review on PR #392). Portal frames mount in open
  // order, so a frame followed in document order by another
  // dialog frame is covered.
  assert.match(code, /document\.querySelectorAll\("dialog"\)/);
  assert.match(code, /frame\.compareDocumentPosition\(other\) & Node\.DOCUMENT_POSITION_FOLLOWING/);
  // Only a still-open modal covers: a closed dialog element later
  // in the document (or one nested inside this dialog) must not
  // disable containment (Copilot + CodeRabbit review on PR #392,
  // head 5f84f47).
  assert.match(
    code,
    /other\.getAttribute\("aria-modal"\) === "true" \|\| other\.hasAttribute\("open"\)/,
  );
  assert.match(code, /frame\.contains\(other\)/);
  assert.match(code, /other\.getClientRects\(\)\.length > 0/);
  assert.match(code, /if \(covered\) \{\s+return;\s+\}/);
});

test("focus outside the dialog is pulled back onto the landing wrapper inside it (#391)", () => {
  assert.match(code, /content\.closest\("dialog"\)/);
  assert.match(code, /frame\.querySelector\('\[tabindex="-1"\]'\)/);
  assert.match(code, /landing\.focus\(\)/);
});
