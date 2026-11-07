import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import process from "node:process";

describe("tagsPageCreateForm", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const tagsPage = readFileSync(join(root, "src", "pages", "TagsPage.tsx"), "utf8");
  const createFormEnd = tagsPage.indexOf("{loading ?");
  const row = readFileSync(join(root, "src", "widgets", "TrailingActionsRow.tsx"), "utf8");
  const picker = readFileSync(join(root, "src", "widgets", "ColorPickerField.tsx"), "utf8");

  test("TagsPage create-form row wraps so Add stays visible (#219)", () => {
    assert.match(
      row,
      /<XStack flexWrap="wrap" gap="\$2" alignItems="center" justifyContent="space-between">\s*\{leading\}/,
      'the TrailingActionsRow XStack must set flexWrap="wrap" so the Add button wraps instead of overflowing (#219)',
    );
    assert.notEqual(createFormEnd, -1, "TagsPage must keep its loading branch boundary");
    const createForm = tagsPage.slice(0, createFormEnd);
    const createRow = createForm.match(
      /<TrailingActionsRow\s+leading=\{\s*<ColorPickerField[\s\S]*?<\/TrailingActionsRow>/,
    );
    assert.ok(
      createRow,
      "TagsPage's create form must compose its ColorPickerField as the row's leading group (#219, #119)",
    );
    assert.match(
      createRow[0],
      /<Button[\s\S]*?accessibilityLabel="Add"/,
      "TagsPage's create-form row must contain the Add button",
    );
  });

  test("ColorPickerField root can shrink inside a flex row (#219)", () => {
    assert.match(
      picker,
      /<YStack gap=\{tokens\.spacing\[2\]\} flexShrink=\{1\} flexGrow=\{1\} minWidth=\{0\}>/,
      "the ColorPickerField root YStack must be shrinkable (flexShrink/flexGrow/minWidth) so its wrapping swatch row can narrow (#219)",
    );
    assert.match(
      picker,
      /flexWrap="wrap"/,
      'the swatch row itself must keep flexWrap="wrap" so swatches wrap as the field narrows (#219)',
    );
  });
});

describe("tagsPageErrorSurface", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(path: string) {
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
      /export type TagsPageOperationResult = unknown;/,
      "the operation result must stay `unknown`: the legacy `() => void` contract discarded " +
        "return values, so handlers returning arbitrary values must remain assignable",
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
      /const \[failedOperation, setFailedOperation\] = useState<TagsPageFailedOperation \| null>\(\s*initialFailedOperation,\s*\);/,
    );
    assert.match(
      page,
      /initialFailedOperation\?: TagsPageFailedOperation \| null;/,
      "the failed-operation seed is an optional prop naming an operation, never a message",
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
    assert.match(
      page,
      /onPress=\{handleSaveEdit\}/,
      "the Save button must run the update operation",
    );
    assert.match(
      page,
      /onPress: \(\) => \{\s*handleDelete\(tag\.id\);/,
      "the Delete row action must run the delete operation",
    );
  });

  test("the error renders as a dismissible error Alert and success/dismiss clear it (#374)", () => {
    assert.match(page, /import \{ Alert \} from "\.\.\/widgets\/Alert\.js";/);
    assert.match(
      page,
      /\{failedOperation \? \(\s*<Alert\s+severity="error"\s+dismissible\s+onDismiss=\{\(\) => \{\s*setFailedOperation\(null\);\s*\}\}\s*>\s*\{tagsPageFailureMessages\[failedOperation\]\}\s*<\/Alert>\s*\) : null\}/,
      "a failed operation renders the page-level error Alert, dismissible, above the form",
    );
    // No explicit accessibilityRole prop: Alert's error severity
    // itself announces with role="alert" (pinned in alert.test
    // .mjs), and a raw RN accessibility prop on a component is
    // exactly what pageWebAria.test.ts (#237) forbids in pages.
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
    // Static captures never press a control (PR #377 review): the
    // story seeds the create failure so the alert renders from the
    // first frame and its Android baseline covers the error surface.
    assert.match(stories, /initialFailedOperation="create"/);
  });

  // The tsc regression case for handler-return compatibility
  // (PR #377 review): under the pre-#374 `() => void` contract,
  // handlers returning a tag, a number, or a promise of a tag
  // typechecked (the value was discarded); a boolean-union result
  // type rejects all three. The snippet must compile cleanly
  // against the page source — a real compiler check, not a scan.
  const handlerCompatSnippet = [
    'import type { TagsPageProps, TagsPageTag } from "../../src/pages/TagsPage.js";',
    "",
    'const tag: TagsPageTag = { id: "1", name: "Baking", color: "indigo" };',
    "",
    'export const legacyReturns: Pick<TagsPageProps, "onCreate" | "onDelete" | "onSaveEdit"> = {',
    "  onCreate: () => tag,",
    "  onDelete: () => 42,",
    "  onSaveEdit: () => Promise.resolve(tag),",
    "};",
    "",
    'export const reportingReturns: Pick<TagsPageProps, "onCreate" | "onDelete" | "onSaveEdit"> = {',
    "  onCreate: () => false,",
    "  onDelete: () => Promise.resolve(false),",
    "  onSaveEdit: () => undefined,",
    "};",
    "",
  ].join("\n");

  const handlerCompatTscArgs = [
    // Files are named on the command line, so the repo tsconfig
    // must not interfere (TS5112 without --ignoreConfig).
    "--ignoreConfig",
    "--noEmit",
    "--strict",
    "--exactOptionalPropertyTypes",
    "--jsx",
    "react-jsx",
    "--module",
    "esnext",
    "--moduleResolution",
    "bundler",
    "--target",
    "es2022",
    "--lib",
    "es2022,dom",
    "--skipLibCheck",
  ];

  test(
    "handlers returning arbitrary values stay assignable to the handler props (#374, PR #377)",
    { timeout: 180_000 },
    () => {
      const tmp = mkdtempSync(join(root, "test/.tmp-tags-compat-"));
      try {
        writeFileSync(join(tmp, "case.ts"), handlerCompatSnippet);
        execFileSync(
          process.execPath,
          [
            join(root, "node_modules/typescript/bin/tsc"),
            ...handlerCompatTscArgs,
            join(tmp, "case.ts"),
          ],
          { cwd: tmp, stdio: "pipe" },
        );
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );
});

describe("tagsPageRowEligibility", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

  function readCode(path: string) {
    return readFileSync(join(root, path), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const page = readCode("src/pages/TagsPage.tsx");
  const stories = readCode("src/pages/TagsPage.stories.tsx");

  test("eligibility rides on the tag data as optional booleans (#375)", () => {
    assert.match(page, /canEdit\?: boolean;/, "TagsPageTag gains an optional canEdit flag");
    assert.match(page, /canDelete\?: boolean;/, "TagsPageTag gains an optional canDelete flag");
    assert.doesNotMatch(
      page,
      /\b(?:canEditTag|canDeleteTag|isTagEditable|isTagDeletable|tagEligibility|editableTagIds|deletableTagIds)\??:/,
      "eligibility must not arrive as a separate predicate or id-list prop — it rides on the tag data",
    );
  });

  test("Edit renders only for edit-eligible rows when the host supplies onStartEdit (#375)", () => {
    assert.match(
      page,
      /\.\.\.\(onStartEdit && tag\.canEdit !== false\s*\? \[\s*\{\s*label: "Edit",/,
      "the Edit action is gated on both onStartEdit and tag.canEdit !== false (absent = eligible)",
    );
  });

  test("Delete renders only for delete-eligible rows (#375)", () => {
    assert.match(
      page,
      /\.\.\.\(tag\.canDelete !== false\s*\? \[\s*\{\s*label: "Delete",/,
      "the Delete action is gated on tag.canDelete !== false (absent = eligible)",
    );
    // Delete must not be gated on the edit flag (or vice versa):
    // the two eligibilities are independent per-row data.
    assert.doesNotMatch(page, /tag\.canEdit !== false\s*\? \[\s*\{\s*label: "Delete",/);
    assert.doesNotMatch(page, /tag\.canDelete !== false\s*\? \[\s*\{\s*label: "Edit",/);
  });

  test("an edit-ineligible row never swaps to the edit form (#375)", () => {
    assert.match(
      page,
      /editingTagId === tag\.id && tag\.canEdit !== false \? \(/,
      "the inline editor renders only for an edit-eligible tag, even if editingTagId names it",
    );
  });

  test("the WithTags story renders a preset-style row without Edit/Delete (#375)", () => {
    assert.match(
      stories,
      /canEdit: false, canDelete: false/,
      "a story row is marked ineligible for both actions (the preset-style case)",
    );
  });

  // The tsc compatibility case: the flags are optional, so a tag
  // literal carrying neither (every existing host's data) and one
  // carrying either or both must all stay assignable to
  // TagsPageTag. A required flag would break existing hosts on a
  // patch upgrade; this pins assignability with a real compiler
  // check, not just a text scan.
  const eligibilitySnippet = [
    'import type { TagsPageTag } from "../../src/pages/TagsPage.js";',
    "",
    'export const legacyTag: TagsPageTag = { id: "1", name: "Baking", color: "indigo" };',
    "",
    "export const presetTag: TagsPageTag = {",
    '  id: "2",',
    '  name: "Preset",',
    '  color: "gray",',
    "  canEdit: false,",
    "  canDelete: false,",
    "};",
    "",
    "export const deleteOnlyTag: TagsPageTag = {",
    '  id: "3",',
    '  name: "Locked name",',
    '  color: "blue",',
    "  canEdit: false,",
    "};",
    "",
  ].join("\n");

  const eligibilityTscArgs = [
    // Files are named on the command line, so the repo tsconfig
    // must not interfere (TS5112 without --ignoreConfig).
    "--ignoreConfig",
    "--noEmit",
    "--strict",
    "--exactOptionalPropertyTypes",
    "--jsx",
    "react-jsx",
    "--module",
    "esnext",
    "--moduleResolution",
    "bundler",
    "--target",
    "es2022",
    "--lib",
    "es2022,dom",
    "--skipLibCheck",
  ];

  test(
    "tags with and without eligibility flags stay assignable to TagsPageTag (#375)",
    { timeout: 180_000 },
    () => {
      const tmp = mkdtempSync(join(root, "test/.tmp-tags-eligibility-"));
      try {
        writeFileSync(join(tmp, "case.ts"), eligibilitySnippet);
        execFileSync(
          process.execPath,
          [
            join(root, "node_modules/typescript/bin/tsc"),
            ...eligibilityTscArgs,
            join(tmp, "case.ts"),
          ],
          { cwd: tmp, stdio: "pipe" },
        );
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );
});
