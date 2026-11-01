/**
 * Contract tests for spudly/design-system#374: TagsPage had no
 * error surface for create/edit/delete failures — a failed save
 * retained the draft but showed the user nothing, and hosts own
 * no markup to render a message (all styling lives in the DS).
 *
 * The settled fix (the page-level error pattern of
 * MealPlanFormPage's `error` / RecipeFormPage's `submitError`,
 * rendered by the page itself):
 * 1. No error-string prop is added and no handler is renamed:
 *    the existing create / save-edit / delete handlers report
 *    failure through their result — `false`, synchronously or
 *    from a promise, or a rejection/throw. Any other result
 *    (including the `void` existing hosts return) is success,
 *    so existing hosts keep working unchanged.
 * 2. The page tracks which operation failed in its own state
 *    and renders a dismissible error Alert above the create
 *    form with a message naming the failed operation. The
 *    alert's error severity carries role="alert"; the wider
 *    announcement mechanics are #329's, out of scope here.
 * 3. A successful operation clears the error; the alert's
 *    dismiss clears it on demand.
 * 4. The FailingSaves story wires every handler to report
 *    failure so the surface is reachable in Storybook QA.
 *
 * Source scan (same rationale as test/tagsPageCreateForm
 * .test.mjs): the repo has no JS renderer for page components
 * (they import react-native), and the invariants are
 * per-literal properties of the source. Comments are stripped
 * before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(path) {
  return readFileSync(join(root, path), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode("src/pages/TagsPage.tsx");
const stories = readCode("src/pages/TagsPage.stories.tsx");
const pagesBarrel = readCode("src/pages/index.ts");

test("handlers report failure through their result; no error-string prop (#374)", () => {
  assert.match(
    page,
    /export type TagsPageOperationResult = boolean \| void \| Promise<boolean \| void>;/,
    "the operation result must admit a boolean or a promise of one, plus the legacy void",
  );
  assert.match(page, /onCreate: \(\) => TagsPageOperationResult;/);
  assert.match(page, /onDelete: \(id: string\) => TagsPageOperationResult;/);
  assert.match(page, /onSaveEdit\?: \(\) => TagsPageOperationResult;/);
  assert.doesNotMatch(
    page,
    /\b(?:editError|createError|deleteError|saveError|errorMessage|operationError)\??:/,
    "TagsPage must not gain an error-string prop — the page renders the error itself",
  );
  assert.match(
    pagesBarrel,
    /type TagsPageOperationResult/,
    "the result type is exported from the pages barrel for hosts that annotate handlers",
  );
});

test("the page tracks the failed operation in its own state (#374)", () => {
  assert.match(
    page,
    /const \[failedOperation, setFailedOperation\] = useState<TagsPageFailedOperation \| null>\(null\);/,
  );
  assert.match(page, /type TagsPageFailedOperation = "create" \| "update" \| "delete";/);
  // A `false` result marks the operation failed; a rejection does too.
  assert.match(page, /setFailedOperation\(result === false \? operation : null\);/);
  assert.match(page, /catch \{\s*setFailedOperation\(operation\);/);
});

test("failed create, edit and delete each show their own message (#374)", () => {
  assert.match(page, /create: "Couldn't create the tag\. Please try again\.",/);
  assert.match(page, /update: "Couldn't save the tag changes\. Please try again\.",/);
  assert.match(page, /delete: "Couldn't delete the tag\. Please try again\.",/);
  // Each control routes through the operation runner under its own key.
  assert.match(page, /void runOperation\("create", onCreate\);/);
  assert.match(page, /void runOperation\("update", \(\) => onSaveEdit\?\.\(\)\);/);
  assert.match(page, /void runOperation\("delete", \(\) => onDelete\(id\)\);/);
  assert.match(page, /onPress=\{handleCreate\}/, "the Add button must run the create operation");
  assert.match(page, /onPress=\{handleSaveEdit\}/, "the Save button must run the update operation");
  assert.match(
    page,
    /onPress: \(\) => \{\s*handleDelete\(tag\.id\);/,
    "the Delete row action must run the delete operation",
  );
});

test("the error renders as a dismissible error Alert and success/dismiss clear it (#374)", () => {
  assert.match(page, /import \{ Alert \} from "\.\.\/components\/Alert\.js";/);
  assert.match(
    page,
    /\{failedOperation \? \(\s*<Alert\s+severity="error"\s+dismissible\s+onDismiss=\{\(\) => \{\s*setFailedOperation\(null\);\s*\}\}\s*>\s*\{tagsPageFailureMessages\[failedOperation\]\}\s*<\/Alert>\s*\) : null\}/,
    "a failed operation renders the page-level error Alert, dismissible, above the form",
  );
  // No explicit accessibilityRole prop: Alert's error severity
  // itself announces with role="alert" (pinned in alert.test
  // .mjs), and a raw RN accessibility prop on a component is
  // exactly what pageWebAria.test.mjs (#237) forbids in pages.
  assert.doesNotMatch(page, /<Alert[^>]*accessibilityRole=/);
  // The alert sits at page level (before the create form), so every
  // operation's failure is visible in the same place.
  const alertAt = page.indexOf("<Alert");
  const formAt = page.indexOf('placeholder="Tag name"');
  assert.ok(alertAt !== -1 && formAt !== -1 && alertAt < formAt, "the alert precedes the form");
  // Success clears: any non-false result resets the failed operation.
  assert.match(page, /result === false \? operation : null/);
});

test("the FailingSaves story wires every handler to report failure (#374)", () => {
  assert.match(stories, /export const FailingSaves: Story = \{/);
  assert.match(stories, /onCreate=\{\(\) => false\}/);
  assert.match(stories, /onDelete=\{\(\) => false\}/);
  assert.match(stories, /onSaveEdit=\{\(\) => false\}/);
});
