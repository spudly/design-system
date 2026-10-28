/**
 * Contract tests for the import/AI page parity fixes
 * (spudly/design-system#254, surfaced by the B7 C4 adoption):
 *
 * 1. ImportReviewPage's hero image carries an accessible name:
 *    the optional `imageAlt` prop (hosts pass the recipe title)
 *    is applied as the RN Image's `accessibilityLabel` —
 *    react-native-web renders it as the image's `alt` text, and
 *    `Image` is a sanctioned translating target in the #237
 *    web-ARIA scan for exactly that reason.
 * 2. ImportTextPage's paste field carries the accessible name
 *    "Recipe text" (the retired web editor's name), not just a
 *    placeholder.
 * 3. ImportUrlPage submits on Enter: the URL field's
 *    submit-editing event fires `onSubmit` under the same guard
 *    as the Import button (non-blank URL, not loading).
 *
 * Source scans, like the repo's other page contract tests: the
 * failures guarded here are accessibility-tree / event-wiring
 * properties of the source literals, and comments are stripped
 * before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");

function pageCode(name) {
  const source = readFileSync(join(pagesDir, `${name}.tsx`), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

test("ImportReviewPage declares an optional imageAlt prop", () => {
  const code = pageCode("ImportReviewPage");
  assert.match(code, /imageAlt\?: string;/, "the props type must carry optional imageAlt");
  assert.match(
    code,
    /export function ImportReviewPage\(\{\s*versionLabel,\s*imageUrl,\s*imageAlt,/,
    "the component must destructure imageAlt",
  );
});

test("ImportReviewPage applies imageAlt as the hero image's accessible name", () => {
  const code = pageCode("ImportReviewPage");
  assert.match(
    code,
    /accessibilityLabel=\{imageAlt\}/,
    "the Image must receive accessibilityLabel={imageAlt} (rendered as alt text on web)",
  );
});

test("ImportTextPage names its paste field 'Recipe text'", () => {
  const code = pageCode("ImportTextPage");
  assert.match(
    code,
    /<TextAreaField[\s\S]*?accessibilityLabel="Recipe text"/,
    'the TextAreaField must carry accessibilityLabel="Recipe text"',
  );
});

test("ImportUrlPage wires the URL field's submit-editing to a guarded submit", () => {
  const code = pageCode("ImportUrlPage");
  assert.match(
    code,
    /const submitFromField = \(\) => \{\s*if \(url\.trim\(\) && !loading\) \{\s*onSubmit\(\);\s*\}\s*\};/,
    "submitFromField must call onSubmit only for a non-blank URL while not loading",
  );
  assert.match(
    code,
    /onSubmitEditing=\{submitFromField\}/,
    "the TextField must wire onSubmitEditing to submitFromField",
  );
  assert.match(
    code,
    /disabled=\{!url\.trim\(\) \|\| loading\}/,
    "the Import button's disabled rule must stay the same guard",
  );
});
