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

test("ShoppingListPage check-off is controlled per line with real checkbox semantics", () => {
  const page = pageSource("ShoppingListPage");
  assert.ok(page.includes("isChecked"), "each line carries its checked state in");
  assert.ok(page.includes("onToggleLine"), "toggles report out through onToggleLine");
  assert.ok(
    page.includes('accessibilityRole="checkbox"'),
    "rows carry checkbox semantics, not a text glyph",
  );
  assert.ok(!page.includes("☑") && !page.includes("☐"), "the app's text glyphs must not cross");
  assert.ok(page.includes("quantityLabel"), "quantities cross pre-composed");
  assert.ok(page.includes("line-through"), "checked lines render struck through");
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

test("MealDetailPage members are view-models with pre-composed subtitles", () => {
  const page = pageSource("MealDetailPage");
  assert.ok(page.includes("subtitle"), "member subtitles cross pre-composed");
  assert.ok(page.includes("isUnavailable"), "unavailable members render their suffix from a flag");
  assert.ok(page.includes("(unavailable)"), "the unavailable suffix renders in the page");
  for (const prop of ["onCook", "onEdit", "onRecipePress"]) {
    assert.ok(page.includes(prop), `MealDetailPage must take ${prop}`);
  }
});

test("MealsHubPage composes MealPlansPage for the plans tab and reports the tab intent", () => {
  const page = pageSource("MealsHubPage");
  assert.ok(page.includes("MealPlansPage"), "the plans tab hosts the DS MealPlansPage");
  assert.ok(page.includes("onSelectTab"), "the tab switch reports out as an intent");
  assert.ok(page.includes("activeTab"), "the active tab crosses as a prop");
  assert.ok(page.includes("subtitle"), "meal subtitles cross pre-composed");
  for (const prop of [
    "onCreateMeal",
    "onCreatePlan",
    "onMealPress",
    "onPlanPress",
    "onDeleteMeal",
    "onDeletePlan",
  ]) {
    assert.ok(page.includes(prop), `MealsHubPage must take ${prop}`);
  }
});

test("stories cover the captured states for each B3b page", () => {
  const expectedStories = {
    MealFormPage: ["Default", "NoSelection", "SaveError"],
    MealPlanFormPage: ["Default", "NoSelection"],
    ShoppingListPage: ["Default", "Loading", "Empty"],
    MealCookingModePage: ["Default", "FirstStep", "LastStep"],
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
