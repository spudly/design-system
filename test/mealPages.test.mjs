/**
 * Contract tests for the B3b meals / meal-planning / shopping
 * pages (design-system #125): MealFormPage, MealPlanFormPage,
 * ShoppingListPage, MealCookingModePage, MealDetailPage, and
 * MealsHubPage — the split view halves of Eciperay's meals
 * cluster views (B2 audit: page views to the DS; queries,
 * mutations, navigation, and form/check-off/step state stay
 * app-side).
 *
 * The contracts pinned here:
 * 1. All six pages are exported from the pages subpath index.
 * 2. Every page is a controlled view: no state of its own
 *    (stories hold state instead), no app imports, no
 *    react-native imports, no fetching.
 * 3. The form pages are controlled per-field (value +
 *    change callback), feed the DS CheckboxSelectList array
 *    selected-ids (never a Set), render per-selected
 *    quantity/servings steppers, and submit as a bare
 *    `onSubmit` intent.
 * 4. ShoppingListPage's check-off is controlled per line
 *    (`isChecked` in, `onToggleLine` out), its rows carry
 *    real checkbox semantics (never the app's ☑/☐ text
 *    glyphs), and quantities cross pre-composed
 *    (`quantityLabel`).
 * 5. MealCookingModePage's progression is controlled
 *    (`stepIndex` in; prev/next/done out), its bounds follow
 *    the DS PrevNextNav convention (back omitted on the
 *    first step), and it sets no font-size-derived
 *    lineHeight (the #162 ban).
 * 6. MealDetailPage and MealsHubPage take pre-composed
 *    subtitles; the hub composes MealPlansPage for its
 *    plans tab (never a nested scroll shell of its own) and
 *    reports the tab switch as an intent.
 * 7. Stories cover the states Chromatic / Android VR
 *    capture for each page.
 *
 * Source scans, like the other page contract tests: the
 * invariant is a per-file property of the source, and the
 * repo has no JS renderer for these components (Chromatic
 * screenshots in CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function pageSource(name) {
  return readFileSync(join(root, "src", "pages", `${name}.tsx`), "utf8");
}

function storySource(name) {
  return readFileSync(join(root, "src", "pages", `${name}.stories.tsx`), "utf8");
}

const PAGES = [
  "MealFormPage",
  "MealPlanFormPage",
  "ShoppingListPage",
  "MealCookingModePage",
  "MealDetailPage",
  "MealsHubPage",
];

test("all six B3b pages are exported from the pages subpath", () => {
  const index = readFileSync(join(root, "src", "pages", "index.ts"), "utf8");
  for (const name of PAGES) {
    assert.ok(index.includes(name), `${name} must be exported from src/pages/index.ts`);
    assert.ok(
      index.includes(`from "./${name}.js"`),
      `${name} must be exported from its own module`,
    );
  }
});

test("every B3b page is controlled: no own state, no app or react-native imports, no fetching", () => {
  for (const name of PAGES) {
    const page = pageSource(name);
    assert.ok(!page.includes("useState"), `${name} must not own state`);
    assert.ok(!page.includes("@eciperay"), `${name} must not import an app package`);
    assert.ok(!page.includes("react-native"), `${name} must not import react-native`);
    assert.ok(!page.includes("useQuery"), `${name} must not fetch`);
  }
});

test("MealFormPage is controlled per field and submits as a bare intent", () => {
  const mealForm = pageSource("MealFormPage");
  for (const prop of [
    "onTitleChange",
    "onNotesChange",
    "onToggleRecipe",
    "onServingsChange",
    "onSubmit",
  ]) {
    assert.ok(mealForm.includes(prop), `MealFormPage must take ${prop}`);
  }
  assert.ok(
    mealForm.includes("CheckboxSelectList"),
    "MealFormPage renders the DS CheckboxSelectList",
  );
  assert.ok(mealForm.includes("selectedRecipeIds"), "MealFormPage takes array selected ids");
  assert.ok(
    !mealForm.includes("new Set"),
    "MealFormPage must not convert to a Set — the host does",
  );
});

test("MealPlanFormPage is controlled per field and submits as a bare intent", () => {
  const planForm = pageSource("MealPlanFormPage");
  for (const prop of [
    "onTitleChange",
    "onNotesChange",
    "onStartsOnChange",
    "onEndsOnChange",
    "onToggleEntry",
    "onQuantityChange",
    "onRecipeServingsChange",
    "onSubmit",
  ]) {
    assert.ok(planForm.includes(prop), `MealPlanFormPage must take ${prop}`);
  }
  assert.ok(
    planForm.includes("CheckboxSelectList"),
    "MealPlanFormPage renders the DS CheckboxSelectList",
  );
  assert.ok(planForm.includes("selectedKeys"), "MealPlanFormPage takes array selected keys");
  assert.ok(
    !planForm.includes("new Set"),
    "MealPlanFormPage must not convert to a Set — the host does",
  );
});

test("meal form steppers floor servings and quantity at 1 (#362)", () => {
  for (const name of ["MealFormPage", "MealPlanFormPage"]) {
    const source = pageSource(name);
    const steppers = source.split("<NumberStepper").slice(1);
    assert.ok(steppers.length > 0, `${name} renders at least one NumberStepper`);
    for (const stepper of steppers) {
      const props = stepper.split("/>")[0];
      assert.ok(
        props.includes("min={1}"),
        `${name}: every NumberStepper must pass min={1} so servings/quantity cannot reach 0`,
      );
    }
  }
});

test("ShoppingListPage check-off is controlled per line with real checkbox semantics", () => {
  const page = pageSource("ShoppingListPage");
  assert.ok(page.includes("isChecked"), "each line carries its checked state in");
  assert.ok(page.includes("onToggleLine"), "toggles report out through onToggleLine");
  assert.ok(
    page.includes("CheckRow"),
    "rows render through the generic CheckRow since the #119 de-styling — the checkbox semantics (routed through the platform translator, #237) and the checked strike-through are pinned in test/checkRow.test.mjs",
  );
  assert.ok(page.includes("label={line.name}"), "row labels use each line's name");
  assert.ok(
    page.includes("checked={line.isChecked}"),
    "row checked state uses each line's isChecked",
  );
  assert.ok(
    page.includes("onToggleLine(line.key)"),
    "toggles report the line's key through onToggleLine",
  );
  assert.ok(!page.includes("☑") && !page.includes("☐"), "the app's text glyphs must not cross");
  assert.ok(page.includes("quantityLabel"), "quantities cross pre-composed");
});

test("MealCookingModePage progression is controlled and bounded by the PrevNextNav convention", () => {
  const page = pageSource("MealCookingModePage");
  for (const prop of ["stepIndex", "onPrev", "onNext", "onDone"]) {
    assert.ok(page.includes(prop), `MealCookingModePage must take ${prop}`);
  }
  assert.ok(
    page.includes("stepIndex === 0 ? {} : { onBack: onPrev }"),
    "the back button is omitted on the first step (the DS PrevNextNav convention)",
  );
  assert.ok(page.includes("StepDots"), "progress renders through the DS StepDots");
  assert.ok(
    !page.includes("lineHeight"),
    "no lineHeight — a font-size-derived one is the #162 ban",
  );
  assert.ok(
    !/import[^;]*CookingModeParts/.test(page),
    "the G9 parts family stays app-side; the page must not import it",
  );
});

test("MealCookingModePage header numbers steps by their combined position, not the per-recipe stepNumber (eciperay#324)", () => {
  const page = pageSource("MealCookingModePage");
  // The header's numerator is the combined index (stepIndex + 1)
  // and its denominator is the combined total (steps.length) —
  // the same combined position StepDots reports as its
  // progressbar label ("Step N of M" from activeIndex + 1).
  /* eslint-disable no-template-curly-in-string -- the expected source text intentionally contains a template literal */
  assert.ok(
    page.includes(
      "stepLabel={`Step ${stepIndex + 1} of ${steps.length} · ${current.recipeTitle}`}",
    ),
    "the step header must read the combined position: stepIndex + 1 of steps.length",
  );
  /* eslint-enable no-template-curly-in-string -- end of the expected source-text literal block */
  assert.ok(
    page.includes("StepDots count={steps.length} activeIndex={stepIndex}"),
    "progress must keep reporting the same combined stepIndex the header uses",
  );
  // A step's stepNumber is per-recipe: in the fixture's combined
  // sequence (3 steps from the first recipe, then the second
  // recipe's first step) the final step carries stepNumber 1 at
  // combined index 3, so a header built from stepNumber reads
  // "Step 1 of 4" while progress reads "Step 4 of 4".
  assert.ok(
    !page.includes("current.stepNumber"),
    "the step header must not use current.stepNumber — it restarts per recipe",
  );
  const fixture = readFileSync(join(root, "src", "pages", "fixtures.ts"), "utf8");
  const cookingFixture = fixture.slice(fixture.indexOf("mealCookingFixture"));
  const stepNumbers = [...cookingFixture.matchAll(/stepNumber: (\d+)/g)]
    .slice(0, 4)
    .map((match) => Number(match[1]));
  assert.deepEqual(
    stepNumbers,
    [1, 2, 3, 1],
    "the cooking fixture must keep a combined sequence whose per-recipe stepNumber restarts, so the LastStep story exercises this regression",
  );
});

test("MealDetailPage members are view-models with pre-composed subtitles", () => {
  const page = pageSource("MealDetailPage");
  assert.ok(page.includes("subtitle"), "member subtitles cross pre-composed");
  assert.ok(page.includes("isUnavailable"), "unavailable members render their suffix from a flag");
  assert.ok(page.includes("(unavailable)"), "the unavailable suffix renders in the page");
  // #248: Cook and Edit navigate, and each member row is a link —
  // they cross as hrefs, not press callbacks.
  for (const prop of ["cookHref", "editHref", "href: string"]) {
    assert.ok(page.includes(prop), `MealDetailPage must take ${prop}`);
  }
  for (const prop of ["onCook", "onEdit", "onRecipePress"]) {
    assert.ok(!page.includes(prop), `MealDetailPage must not take ${prop} (#248)`);
  }
});

test("MealsHubPage composes MealPlansPage for the plans tab and reports the tab intent", () => {
  const page = pageSource("MealsHubPage");
  assert.ok(page.includes("MealPlansPage"), "the plans tab hosts the DS MealPlansPage");
  assert.ok(page.includes("onSelectTab"), "the tab switch reports out as an intent");
  assert.ok(page.includes("activeTab"), "the active tab crosses as a prop");
  assert.ok(page.includes("subtitle"), "meal subtitles cross pre-composed");
  // #248: both create actions navigate and each meal row is a
  // link, so they cross as hrefs; the deletes stay callbacks.
  for (const prop of ["createMealHref", "createPlanHref", "onDeleteMeal", "onDeletePlan"]) {
    assert.ok(page.includes(prop), `MealsHubPage must take ${prop}`);
  }
  for (const prop of ["onCreateMeal", "onCreatePlan", "onMealPress", "onPlanPress"]) {
    assert.ok(!page.includes(prop), `MealsHubPage must not take ${prop} (#248)`);
  }
  // Stephen's #248 ruling: an action never renders in link form —
  // the row Delete is the button-role TextAction, never a TextLink.
  // Since the #119 de-styling the row renders through the generic
  // TextActionCardRow; the TextAction rendering itself is pinned
  // in test/textActionCardRow.test.mjs.
  assert.ok(
    page.includes("TextActionCardRow"),
    "meal rows render through the generic TextActionCardRow (#119)",
  );
  assert.ok(!page.includes("TextLink"), "MealsHubPage must not render a TextLink");
});

test("stories cover the captured states for each B3b page", () => {
  const expectedStories = {
    MealFormPage: ["Default", "NoSelection", "SaveError"],
    MealPlanFormPage: ["Default", "NoSelection"],
    ShoppingListPage: ["Default", "Loading", "Empty"],
    MealCookingModePage: ["Default", "FirstStep", "LastStep", "LoadError"],
    MealDetailPage: ["Default", "NoNotesOrNutrition"],
    MealsHubPage: ["Default", "PlansTab", "Empty"],
  };
  for (const [name, stories] of Object.entries(expectedStories)) {
    const story = storySource(name);
    assert.ok(
      story.includes(`title: "Pages/Eciperay/${name}"`),
      `${name} stories must declare the organized Pages/Eciperay title`,
    );
    for (const storyName of stories) {
      assert.ok(
        story.includes(`export const ${storyName}`),
        `${name} stories must export ${storyName}`,
      );
    }
  }
});
