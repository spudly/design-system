/**
 * Contract tests for the B3a recipe-form pages (design-system
 * #124): RecipeFormPage and its three shells — EditRecipePage,
 * EditVersionPage, ManualEntryPage — the split view half of
 * Eciperay's RecipeForm + shell views (B2 audit: form view to the
 * DS; form state, parent-version diffing, AI calls, image upload,
 * and submission stay app-side).
 *
 * The contracts pinned here:
 * 1. All four pages are exported from the pages subpath index.
 * 2. RecipeFormPage is a controlled view: no state of its own, no
 *    app imports, no react-native imports — field values and
 *    change callbacks cross as props, and submission is a bare
 *    `onSubmit` intent (the host builds the recipe input).
 * 3. The three pending-contract sections are render slots:
 *    `renderImageSection` (receives the revert affordance),
 *    `renderIngredientsSection`, `renderInstructionsSection`;
 *    under `contentLocked` the list slots do not render and the
 *    lock notice does.
 * 4. The version-diff wash is the DS fields' semantic `changed`
 *    variant (warning step 5 border / step 1 fill on TextField and
 *    TextAreaField), never page-level color props on the fields.
 * 5. Option data crosses as view-models: status and tag options
 *    are props, rendered through the DS ToggleChipGroup in single
 *    and multiple mode.
 * 6. The shells mirror the app views: EditRecipePage /
 *    ManualEntryPage render their headings around the form;
 *    EditVersionPage renders the draft heading, the import banner,
 *    and the not-editable state (error + optional back link, no
 *    form).
 * 7. Stories cover the states Chromatic / Android VR capture:
 *    form Default / Empty / ContentLocked / VersionDiff, shells'
 *    Default, EditVersionPage's NotEditable.
 *
 * Source scans, like the other page contract tests: the invariant
 * is a per-file property of the source, and the repo has no JS
 * renderer for these components (Chromatic screenshots in CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function source(dir, name) {
  return readFileSync(join(root, "src", dir, `${name}.tsx`), "utf8");
}

function pageSource(name) {
  return source("pages", name);
}

function storySource(name) {
  return readFileSync(join(root, "src", "pages", `${name}.stories.tsx`), "utf8");
}

test("all four B3a pages are exported from the pages subpath", () => {
  // Source scan of the subpath index: dist/pages is not
  // Node-importable (page components may import react-native),
  // the same reason the other page contract tests scan source.
  const index = readFileSync(join(root, "src", "pages", "index.ts"), "utf8");
  for (const name of ["RecipeFormPage", "EditRecipePage", "EditVersionPage", "ManualEntryPage"]) {
    assert.ok(index.includes(name), `${name} must be exported from src/pages/index.ts`);
    assert.ok(
      index.includes(`from "./${name}.js"`),
      `${name} must be exported from its own module`,
    );
  }
});

test("RecipeFormPage is controlled: no own state, no app or react-native imports", () => {
  const form = pageSource("RecipeFormPage");
  assert.ok(!form.includes("useState"), "the form view must not own field state");
  assert.ok(!form.includes("@eciperay"), "the form view must not import an app package");
  assert.ok(!form.includes("react-native"), "the form view must not import react-native");
  assert.ok(!form.includes("useQuery"), "the form view must not fetch");
  for (const prop of [
    "onTitleChange",
    "onDescriptionChange",
    "onServingsChange",
    "onStatusChange",
    "onTagIdsChange",
    "onSubmit",
  ]) {
    assert.ok(form.includes(prop), `controlled contract missing ${prop}`);
  }
});

test("the pending-contract sections are slots, and the lock replaces the list slots", () => {
  const form = pageSource("RecipeFormPage");
  for (const slot of [
    "renderImageSection",
    "renderIngredientsSection",
    "renderInstructionsSection",
  ]) {
    assert.ok(form.includes(slot), `slot ${slot} missing`);
  }
  assert.ok(
    form.includes('renderImageSection(revertAction("image"))'),
    "the image slot must receive the image revert affordance",
  );
  assert.ok(
    form.includes("contentLocked ? null : renderIngredientsSection"),
    "the ingredient slot must not render under the content lock",
  );
  assert.ok(
    form.includes("Ingredients and instructions are locked on the active version"),
    "the lock notice is missing",
  );
});

test("the diff wash is the fields' semantic `changed` variant, defined in the components", () => {
  const form = pageSource("RecipeFormPage");
  assert.ok(form.includes('changed={isChanged("title")}'), "title field must pass `changed`");
  assert.ok(
    form.includes('changed={isChanged("description")}'),
    "description field must pass `changed`",
  );
  for (const component of ["TextField", "TextAreaField"]) {
    const src = source("components", component);
    assert.ok(src.includes("changed: {"), `${component} must define the changed variant`);
    assert.ok(
      src.includes("tokens.colors.warning.warning5"),
      `${component}'s changed variant must use the warning step-5 border`,
    );
    assert.ok(
      src.includes("tokens.colors.warning.warning1"),
      `${component}'s changed variant must use the warning step-1 fill`,
    );
  }
});

test("status and tag options cross as view-models through ToggleChipGroup", () => {
  const form = pageSource("RecipeFormPage");
  assert.ok(form.includes('mode="single"'), "status picker must be a single-mode chip group");
  assert.ok(form.includes('mode="multiple"'), "tag picker must be a multiple-mode chip group");
  assert.ok(form.includes("statusOptions"), "status options must cross as props");
  assert.ok(form.includes("tagOptions"), "tag options must cross as props");
  assert.ok(form.includes("isLoadingTags"), "tag loading must cross as a prop");
});

test("the shells mirror the app views' chrome", () => {
  const edit = pageSource("EditRecipePage");
  assert.ok(edit.includes("Edit Recipe"), "EditRecipePage heading missing");
  assert.ok(edit.includes("{children}"), "EditRecipePage must render its children (the form)");

  const manual = pageSource("ManualEntryPage");
  assert.ok(manual.includes("Manual Entry"), "ManualEntryPage heading missing");
  assert.ok(manual.includes("{children}"), "ManualEntryPage must render its children (the form)");

  const version = pageSource("EditVersionPage");
  // eslint-disable-next-line no-template-curly-in-string -- expected source text intentionally contains a template literal
  assert.ok(version.includes("Edit Draft (v${versionNumber})"), "draft heading missing");
  // eslint-disable-next-line no-template-curly-in-string -- expected source text intentionally contains a template literal
  assert.ok(version.includes("based on imported v${parentVersionNumber}"), "import banner missing");
  assert.ok(
    version.includes("This version can no longer be edited."),
    "not-editable state missing",
  );
  assert.ok(version.includes("Back to recipe"), "not-editable back link missing");
});

test("stories cover the captured states", () => {
  const formStories = storySource("RecipeFormPage");
  for (const story of ["Default", "Empty", "ContentLocked", "VersionDiff"]) {
    assert.ok(
      formStories.includes(`export const ${story}`),
      `RecipeFormPage story ${story} missing`,
    );
  }
  assert.ok(
    storySource("EditVersionPage").includes("export const NotEditable"),
    "EditVersionPage NotEditable story missing",
  );
  for (const shell of ["EditRecipePage", "ManualEntryPage", "EditVersionPage"]) {
    const stories = storySource(shell);
    assert.ok(stories.includes("export const Default"), `${shell} Default story missing`);
    assert.ok(
      stories.includes("<RecipeFormPage"),
      `${shell} stories must compose the real form inside the shell`,
    );
  }
});
