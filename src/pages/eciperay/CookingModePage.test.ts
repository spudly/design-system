/**
 * Contract tests for #871: CookingModePage gains the
 * `cookLogForm` data prop, following the #687 pattern on
 * RecipeDetailPage/RecipesPage — when the host passes the
 * form data, the page renders the DS RatingForm (dark
 * variant) itself in place of the step view, through
 * StepOverlay's panel mode. No host-rendered form UI, and
 * no change to the existing step view.
 *
 * Source scans, like the other page contract tests: the
 * invariant is a per-file property of the source, and the
 * repo has no JS renderer for these components (Chromatic
 * screenshots in CI). Comments are stripped before
 * scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function readCode(path: string) {
  return readFileSync(join(root, path), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode("src/pages/eciperay/CookingModePage.tsx");
const stories = readCode("src/pages/eciperay/CookingModePage.stories.tsx");
const pagesBarrel = readCode("src/pages/index.ts");

function typeBlock(source: string, name: string) {
  const start = source.indexOf(`export type ${name} = {`);
  assert.ok(start !== -1, `${name} must be an exported object type`);
  const end = source.indexOf("};", start);
  assert.ok(end > start, `${name} must close`);
  return source.slice(start, end);
}

test("the cookLogForm prop and its types follow the #687 shape (#871)", () => {
  assert.match(
    page,
    /cookLogForm\?: CookingModePageCookLogForm \| null;/,
    "CookingModePageProps must declare cookLogForm?: CookingModePageCookLogForm | null",
  );
  const values = typeBlock(page, "CookingModePageCookLogFormValues");
  assert.ok(values.includes("rating: 1 | 2 | 3 | 4 | 5 | null;"), "values carry the rating");
  assert.ok(values.includes("notes: string | null;"), "values carry the notes");
  const form = typeBlock(page, "CookingModePageCookLogForm");
  assert.ok(
    form.includes("onSubmit: (values: CookingModePageCookLogFormValues) => void;"),
    "the form carries onSubmit with the values view-model",
  );
  assert.ok(form.includes("onSkip: () => void;"), "the form carries onSkip");
  assert.ok(form.includes("isPending: boolean;"), "the form carries isPending");
  for (const override of [
    "title?: string;",
    "notesPlaceholder?: string;",
    "secondaryLabel?: string;",
  ]) {
    assert.ok(form.includes(override), `the form carries the ${override} copy override`);
  }
  assert.ok(
    !form.includes("recipeId"),
    "no recipeId — unlike RecipesPage there is only one recipe/form on this page",
  );
  assert.match(
    pagesBarrel,
    /type CookingModePageCookLogForm,/,
    "the form type is re-exported from the pages barrel",
  );
  assert.match(
    pagesBarrel,
    /type CookingModePageCookLogFormValues/,
    "the values type is re-exported from the pages barrel",
  );
});

test("the form branch renders the dark RatingForm before the step guard (#871)", () => {
  assert.match(
    page,
    /import \{ RatingForm \} from "\.\.\/\.\.\/widgets\/form\/RatingForm\.js";/,
    "the page imports the DS RatingForm",
  );
  const formBranch = page.indexOf("if (cookLogForm) {");
  assert.ok(formBranch !== -1, "the page must branch on the cookLogForm data");
  const stepGuard = page.indexOf("steps.at(stepIndex)");
  assert.ok(
    formBranch < stepGuard,
    "the form branch must precede the step/out-of-range rendering — the hosts open the form from Done on any step",
  );
  assert.match(page, /<RatingForm\s+variant="dark"/, "the form renders in its dark variant");
  for (const passThrough of [
    "onSubmit={cookLogForm.onSubmit}",
    "onSkip={cookLogForm.onSkip}",
    "isPending={cookLogForm.isPending}",
    "title={cookLogForm.title}",
    "notesPlaceholder={cookLogForm.notesPlaceholder}",
    "secondaryLabel={cookLogForm.secondaryLabel}",
  ]) {
    assert.ok(page.includes(passThrough), `the form branch passes ${passThrough} through`);
  }
  assert.match(page, /panel=\{\s*<RatingForm/, "the form renders through StepOverlay's panel mode");
});

test("the step branch is unchanged when the prop is absent (#871)", () => {
  const stepBranch = page.slice(page.indexOf("steps.at(stepIndex)"));
  assert.match(stepBranch, /<StepOverlay/, "the step branch still renders StepOverlay");
  assert.match(stepBranch, /<StepNavControls/, "the step branch still renders StepNavControls");
  assert.ok(!stepBranch.includes("RatingForm"), "no RatingForm in the step branch");
  assert.match(stepBranch, /stepLabel=\{`Step \$\{current\.stepNumber\} of \$\{steps\.length\}`\}/);
  assert.match(stepBranch, /onDone=\{onDone\}/, "the step branch keeps its Done pill callback");
});

test("the CookLogFormOpen story passes cookLogForm data over a valid step (#871)", () => {
  assert.match(stories, /export const CookLogFormOpen/);
  const story = stories.slice(stories.indexOf("export const CookLogFormOpen"));
  assert.ok(story.includes("cookLogForm={{"), "the story passes cookLogForm data");
  assert.ok(story.includes("isPending: false"), "the story's form is not pending");
  assert.ok(story.includes("stepIndex={1}"), "a valid step sits underneath the form");
});
