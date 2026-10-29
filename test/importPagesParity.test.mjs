/**
 * Contract tests for the import/AI page parity fixes
 * (spudly/design-system#254, surfaced by the B7 C4 adoption):
 *
 * 1. ImportReviewPage's hero image carries an accessible name:
 *    the optional `imageAlt` prop (hosts pass the recipe title)
 *    is passed as Thumbnail's `accessibilityLabel` in its
 *    `banner` presentation — Thumbnail routes a supplied name
 *    through the accessibility translator (an accessibility
 *    element named on both platforms) and renders an unnamed
 *    image decorative; that mechanism is pinned in
 *    thumbnail.test.mjs. (Before the #119 ai-import tranche
 *    the page applied the name to a raw RN Image itself.)
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

test("ImportReviewPage's Make edits stays a callback — the #248 mutation exemption", () => {
  const code = pageCode("ImportReviewPage");
  // Stephen's #248 ruling (2026-10-29): "Make edits" creates a
  // draft and then opens the editor — a mutation whose primary
  // job is the creation, so it is EXEMPT from the href rule and
  // stays a press callback (with its "Creating draft…" pending
  // state); the host does not pre-create drafts.
  assert.match(code, /onStartEdits: \(\) => void;/, "Make edits must stay a callback prop");
  assert.match(
    code,
    /<Button variant="secondary" disabled=\{busy\} onPress=\{onStartEdits\}>/,
    "Make edits must render as a press button, not a link",
  );
  assert.doesNotMatch(
    code,
    /startEditsHref|makeEditsHref|editsHref/,
    "no edits href may exist — the exemption is by design, not an omission",
  );
});

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
  // The hero renders through Thumbnail's banner presentation
  // (the full-width 192px cover shape Thumbnail was extracted
  // from this page's hand-styled Image), and the accessible
  // name crosses only when the host supplied one — the
  // conditional-spread idiom, since `imageAlt` is optional and
  // the repo type-checks with exactOptionalPropertyTypes.
  assert.match(
    code,
    /<Thumbnail\s+variant="banner"\s+src=\{imageUrl\}/,
    "the hero image must render through Thumbnail's banner presentation",
  );
  assert.match(
    code,
    /\{\.\.\.\(imageAlt \? \{ accessibilityLabel: imageAlt \} : \{\}\)\}/,
    "imageAlt must cross as Thumbnail's accessibilityLabel when supplied (Thumbnail makes a named image an accessibility element and keeps an unnamed one decorative — pinned in thumbnail.test.mjs)",
  );
  assert.doesNotMatch(
    code,
    /from "react-native"|<Image/,
    "the page must not render a raw Image — the presentation lives in Thumbnail",
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
