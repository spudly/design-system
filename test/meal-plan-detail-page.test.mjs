/**
 * Contract test for MealPlanDetailPage (spudly/design-system#49).
 *
 * MealPlanDetailPage is the design-system port of the Eciperay
 * app's meal plan detail screen (MealPlanDetailView in
 * spudly/eciperay packages/app), and its structure is the
 * contract this test guards in source:
 * 1. The props are a state union: `{ state: "loading" }` renders
 *    only the spinner shell, because the app screen gates on its
 *    loading state and has no distinct not-found UI (a missing
 *    plan stays on the gate). The absence of a not-found member
 *    is pinned — the union grows one only when the app does.
 * 2. The shell is the scrolling ScreenContainer with no
 *    FlatList: the detail's entries are a flat, unpaginated list
 *    inside a section card (no week grid, no virtualization —
 *    #188's bounded-list structure does not apply).
 * 3. The actions are exactly the app screen's: Shopping list
 *    and Edit buttons, entry presses, and the goals section's
 *    set-goals link. There is deliberately no delete callback —
 *    deleting a plan is the list row's action, and adding or
 *    removing entries happens on the plan form screen.
 * 4. Entries carry two id spaces: the entry's own `id` (the row
 *    key) and the `targetId` its press reports, because a plan
 *    can hold the same recipe twice and meal/recipe rows
 *    navigate to different screens (onMealPress / onRecipePress).
 *    A recipe entry with lost access renders its "(unavailable)"
 *    suffix and carries no press wiring.
 * 5. The nutrition-goals section is view-modeled, not slotted:
 *    it renders when the plan has goal progress or a nutrition
 *    summary, shows the set-goals hint when no goals are set,
 *    and its link renders only with onSetGoalsPress. The absence
 *    of any render slot is pinned (the header's audit: the app's
 *    goal view is pure presentation over data). Since #78 the
 *    section also carries an explicit visibility control
 *    (`goalsSectionVisibility`, default "auto" = the rule above)
 *    so the present-but-unavailable nutrition case can force
 *    the hint-only section.
 * 6. An entry-less plan renders the bare "Entries" section —
 *    this screen has no empty message, unlike the list pages.
 * 7. The component is exported from the pages subpath index,
 *    and stories exercise the Default, Empty, Loading, NoGoals,
 *    and NutritionUnavailable (#78) states so Chromatic
 *    captures them.
 *
 * This is a source scan, not a render test: the repo has no JS
 * renderer for these components (Chromatic screenshots in CI),
 * and the invariant is a per-literal property of the source (same
 * rationale as test/meal-plans-page.test.mjs). Comments are
 * stripped before scanning so prose cannot satisfy — or, for the
 * pinned absences, accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "MealPlanDetailPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MealPlanDetailPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MealPlanDetailPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full MealPlanDetailPage source");
  assert.match(code, /export function MealPlanDetailPage/);
});

test("the props are a loading | ready union, with no not-found member", () => {
  assert.match(code, /export type MealPlanDetailPageProps = \{ state: "loading" \}/);
  assert.match(
    code,
    /props\.state === "loading"/,
    "the loading branch must key off the state union",
  );
  assert.match(
    code,
    /<Spinner label="Loading meal plan" \/>/,
    "the loading state must render only the spinner shell",
  );
  assert.doesNotMatch(
    code,
    /notFound|NotFound/,
    "the app screen has no not-found state — the union must not invent one",
  );
});

test("the shell is the scrolling ScreenContainer, with no FlatList", () => {
  assert.match(code, /<ScreenContainer>/, "the detail must render the default (scrolling) shell");
  assert.doesNotMatch(
    code,
    /<FlatList/,
    "the entries are a flat unpaginated list in a section card — no virtualization",
  );
  assert.doesNotMatch(
    code,
    /scrollable=\{false\}/,
    "the shell must scroll, mirroring ScreenScroll",
  );
});

test("the view-model and callback contract matches the declared props", () => {
  assert.match(code, /title: string;/);
  assert.match(code, /entries: MealPlanDetailPageEntry\[\];/);
  assert.match(code, /onMealPress: \(mealId: string\) => void;/);
  assert.match(code, /onRecipePress: \(recipeId: string\) => void;/);
  assert.match(code, /onShoppingListPress: \(\) => void;/);
  assert.match(code, /onEditPress: \(\) => void;/);
  assert.match(code, /onSetGoalsPress\?: \(\) => void;/);
  assert.match(code, /nutritionGoals\?: MealPlanDetailPageNutritionGoals \| null;/);
});

test("the actions are exactly the app screen's — no delete, no entry editing", () => {
  assert.match(code, />Shopping list<\/Button>/, "the primary action must be the shopping list");
  assert.match(code, />\s*Edit\s*<\/Button>/, "the secondary action must be Edit");
  assert.doesNotMatch(
    code,
    /onDelete|onPlanDelete|onRemoveEntry|onAddEntry/,
    "deleting a plan is the list row's action; entry add/remove lives on the form screen",
  );
});

test("entry presses report the target id, by kind", () => {
  assert.match(
    code,
    /onMealPress\(entry\.targetId\)/,
    "meal rows must fire onMealPress with the entry's target id",
  );
  assert.match(
    code,
    /onRecipePress\(entry\.targetId\)/,
    "recipe rows must fire onRecipePress with the entry's target id",
  );
  assert.match(code, /kind: "meal" \| "recipe";/, "entries must carry their kind");
  assert.match(
    code,
    /targetId: string;/,
    "entries must carry the press target separately from the row key",
  );
});

test("an unavailable recipe entry shows its suffix and does not press", () => {
  assert.match(code, /" \(unavailable\)"/, "the access-lost suffix must render on the title line");
  assert.match(
    code,
    /accessibilityState: \{ disabled: true \}/,
    "the unavailable row must be marked disabled",
  );
  assert.match(
    code,
    /isUnavailable\s*\?\s*\{\s*accessibilityState/,
    "the unavailable branch must carry no press wiring — the press props live in the other branch",
  );
});

test("the goals section follows the app's visibility and hint rules", () => {
  assert.match(
    code,
    /\{showGoals \? \(/,
    "the goals section must be guarded by its visibility rule",
  );
  assert.match(
    code,
    /nutritionGoals !== null\) \|\| !!nutritionLabel/,
    "the section renders when the plan has goal progress or a nutrition summary",
  );
  assert.match(code, /Plan total: \{nutritionLabel\}/, "the section repeats the plan total line");
  assert.match(
    code,
    /Set daily nutrition goals to compare this plan\./,
    "the no-goals hint copy must match the app's",
  );
  assert.match(
    code,
    /\{onSetGoalsPress \? \(/,
    "the set-goals link must render only when its callback is provided",
  );
  assert.match(code, />Set nutrition goals<\/TextLink>/, "the link label must match the app's");
});

test("an entry-less plan renders the bare Entries section, with no empty message", () => {
  assert.match(code, /<SectionCard title="Entries">/, "the entries section must always render");
  assert.doesNotMatch(
    code,
    /EmptyState/,
    "the app detail screen has no empty-entries message — the bare section is the faithful state",
  );
});

test("there is deliberately no app-content render slot", () => {
  assert.doesNotMatch(
    code,
    /render\w+\?:/,
    "a render slot must be a conscious contract change (see the header audit), not drift",
  );
  assert.doesNotMatch(
    code,
    /ReactNode/,
    "MealPlanDetailPage takes no ReactNode props — the goals section is view-modeled data",
  );
});

test("the component is exported from the pages subpath index", () => {
  assert.match(index, /MealPlanDetailPage/);
  assert.match(index, /type MealPlanDetailPageProps/);
  assert.match(index, /from "\.\/MealPlanDetailPage\.js"/);
});

test("the goals section has an explicit visibility control (#78)", () => {
  assert.match(
    code,
    /goalsSectionVisibility\?: "auto" \| "shown" \| "hidden";/,
    "the contract must carry the tri-state visibility control",
  );
  assert.match(
    code,
    /goalsSectionVisibility = "auto"/,
    "auto must be the default so existing consumers keep the original rule",
  );
  assert.match(
    code,
    /goalsSectionVisibility === "shown"/,
    '"shown" must force the section for the present-but-unavailable case',
  );
  assert.match(
    code,
    /goalsSectionVisibility !== "hidden"/,
    '"hidden" must suppress the section even when the auto rule would render it',
  );
  assert.match(
    stories,
    /export const NutritionUnavailable/,
    "a story must exercise the forced hint-only section",
  );
  assert.match(
    stories,
    /goalsSectionVisibility="shown"/,
    "the NutritionUnavailable story must use the explicit control",
  );
});

test("stories exercise the default, empty, loading, and no-goals states", () => {
  for (const name of ["Default", "Empty", "Loading", "NoGoals"]) {
    assert.match(
      stories,
      new RegExp(`export const ${name}`),
      `MealPlanDetailPage.stories.tsx must export a ${name} story`,
    );
  }
});
