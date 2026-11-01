/**
 * Contract tests for spudly/design-system#375: TagsPage rendered
 * row Edit/Delete actions unconditionally and `TagsPageTag`
 * carried no eligibility signal — so tags a host's server will
 * not let the caller change (Eciperay's preset tags) presented
 * Edit/Delete controls that could only fail server-side.
 *
 * The settled fix, in the caller-supplied-data style:
 * 1. Eligibility rides on the tag data itself: `TagsPageTag`
 *    gains optional `canEdit` / `canDelete` booleans. There is
 *    no eligibility predicate prop and no preset-specific
 *    concept in the contract — the flags are generic per-row
 *    data any host can compute however it likes.
 * 2. Both flags default to eligible when absent, so existing
 *    hosts that pass neither see Edit (when they supply
 *    `onStartEdit`) and Delete on every row, exactly as before
 *    #375. A tsc case below pins that a tag literal without
 *    the flags — and one with them — both stay assignable.
 * 3. The row renders Edit only where the host supplied
 *    `onStartEdit` AND the tag is edit-eligible, and Delete
 *    only where the tag is delete-eligible. The two flags are
 *    independent: a tag may offer one action without the other.
 * 4. An edit-ineligible row never swaps to the inline edit
 *    form, even if the host's `editingTagId` names it — the
 *    editor is an Edit affordance too.
 * 5. The WithTags story covers the rendering: its last row is
 *    a preset-style tag marked ineligible for both actions and
 *    renders its badge with no Edit/Delete.
 *
 * Source scan (same rationale as test/tagsPageErrorSurface
 * .test.mjs): the repo has no JS renderer for page components
 * (they import react-native), and the invariants are
 * per-literal properties of the source. Comments are stripped
 * before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
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
