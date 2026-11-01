/**
 * Contract tests for eciperay#338: MealCookingModePage had
 * no error state, so when the meal cook-plan request failed
 * (the endpoint can answer 404 / 409 / 502) hosts gating on
 * loading / no-plan never mounted the page and the user sat
 * on a loading spinner forever, with no error text.
 *
 * The settled fix (the PublicRecipePage precedent — error
 * states carried in the page's props as union members):
 * 1. The props become a union: the ready member keeps its
 *    existing flat shape (its `state` discriminator stays
 *    optional, so existing hosts keep working unchanged),
 *    and a `{ state: "error" }` member carries the failure.
 * 2. The error member needs no steps — a host renders it
 *    the moment its query fails, in place of its loading
 *    gate. It carries the meal title when the host has it,
 *    an optional host-supplied message, and the cooking
 *    mode's own Done intent as the way out.
 * 3. The error renders as the established page-level error
 *    pattern: an error `Alert` in the standard page shell.
 *    The Alert's error severity carries the alert role; the
 *    wider announcement mechanics are design-system#329's
 *    and are deliberately not prejudged here.
 * 4. Without a host message, the page's own generic copy
 *    renders (DS-owned copy, the PublicRecipePage
 *    precedent) — it names the failed load without
 *    claiming a cause.
 * 5. The LoadError story pins the state for Storybook QA
 *    and the visual-regression captures: the alert renders
 *    from the first frame, with no control press needed.
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

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(path) {
  return readFileSync(join(root, path), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode("src/pages/MealCookingModePage.tsx");
const stories = readCode("src/pages/MealCookingModePage.stories.tsx");
const pagesBarrel = readCode("src/pages/index.ts");

function typeBlock(source, name) {
  const start = source.indexOf(`export type ${name} = {`);
  assert.ok(start !== -1, `${name} must be an exported object type`);
  const end = source.indexOf("};", start);
  assert.ok(end > start, `${name} must close`);
  return source.slice(start, end);
}

test("the props are a union with an error member (eciperay#338)", () => {
  assert.match(
    page,
    /export type MealCookingModePageProps =\s+MealCookingModePageReadyProps \| MealCookingModePageErrorProps;/,
    "MealCookingModePageProps must union the ready and error members",
  );
  const errorProps = typeBlock(page, "MealCookingModePageErrorProps");
  assert.ok(errorProps.includes('state: "error";'), "the error member is discriminated by state");
  assert.ok(errorProps.includes("mealTitle?: string;"), "the meal title is optional on error");
  assert.ok(
    errorProps.includes("errorMessage?: string;"),
    "the host may supply the failure's wording",
  );
  assert.ok(errorProps.includes("onDone: () => void;"), "Done is the error state's way out");
  for (const readyOnly of ["steps", "stepIndex", "onPrev", "onNext"]) {
    assert.ok(
      !errorProps.includes(readyOnly),
      `the error member must not require ${readyOnly} — a failed load has no steps to pass`,
    );
  }
  assert.match(
    pagesBarrel,
    /type MealCookingModePageErrorProps/,
    "the error props type is exported from the pages barrel",
  );
  assert.match(
    pagesBarrel,
    /type MealCookingModePageReadyProps/,
    "the ready props type is exported from the pages barrel",
  );
});

test("the ready member stays backward compatible (eciperay#338)", () => {
  const readyProps = typeBlock(page, "MealCookingModePageReadyProps");
  assert.ok(
    readyProps.includes('state?: "ready";'),
    "the ready discriminator stays optional so existing hosts passing flat props keep working",
  );
  for (const prop of ["mealTitle: string;", "stepIndex: number;", "onPrev", "onNext", "onDone"]) {
    assert.ok(readyProps.includes(prop), `the ready member must keep ${prop}`);
  }
});

test("the error state renders the page-level error Alert instead of the step UI (eciperay#338)", () => {
  assert.match(page, /import \{ Alert \} from "\.\.\/components\/Alert\.js";/);
  const errorBranch = page.indexOf('props.state === "error"');
  assert.ok(errorBranch !== -1, "the page must branch on the error state");
  const stepsRead = page.indexOf("steps.at(stepIndex)");
  assert.ok(
    errorBranch < stepsRead,
    "the error branch must resolve before any step is read — the error member carries no steps",
  );
  assert.match(
    page,
    /<Alert severity="error">\{errorMessage \?\? LOAD_ERROR_MESSAGE\}<\/Alert>/,
    "the error renders as an error Alert, falling back to the page's own copy",
  );
  assert.ok(
    page.includes(
      'const LOAD_ERROR_MESSAGE = "Couldn\'t load the cook plan for this meal. Please try again.";',
    ),
    "the generic copy names the failed load without claiming a cause",
  );
  assert.match(
    page,
    /<Button variant="secondary" onPress=\{onDone\}>/,
    "the error state's Done button reports the page's Done intent",
  );
  assert.ok(
    !page.includes("aria-live") && !page.includes("accessibilityLiveRegion"),
    "announcement timing is #329's — the page must not prejudge it",
  );
});

test("the LoadError story pins the error state from the first frame (eciperay#338)", () => {
  assert.match(stories, /export const LoadError/);
  const story = stories.slice(stories.indexOf("export const LoadError"));
  assert.ok(story.includes('state="error"'), "the story renders the error member");
  assert.ok(story.includes("mealTitle={mealCookingFixture.mealTitle}"), "the story names the meal");
});
