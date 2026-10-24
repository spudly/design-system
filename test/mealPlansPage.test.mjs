/**
 * Contract test for MealPlansPage (spudly/design-system#49).
 *
 * MealPlansPage is the design-system port of the Eciperay app's
 * meal plan list — the "Meal plans" tab of its Meals hub
 * (MealsHubView in spudly/eciperay packages/app) — and its
 * structure is the contract this test guards in source:
 * 1. The shell is the scrolling ScreenContainer with no FlatList:
 *    the app fetches the whole plan list at once and renders it
 *    unpaginated in a scroll view, so RecipesPage's bounded-list
 *    structure (#188) does not apply — a FlatList here would be a
 *    structure the app screen never had.
 * 2. The view-model and callbacks match the component's contract:
 *    plan items in ({id, title, subtitle}), press intents out by
 *    id, with onCreatePlan / onPlanDelete optional.
 * 3. Optional actions omit cleanly: the create button and the
 *    per-row Delete render only when their callbacks are provided
 *    (the RecipesPage optional-callback idiom), so a read-only
 *    consumer gets a clean list.
 * 4. The states follow the app: loading swaps the content for the
 *    spinner (checked before the empty/list branches — the app
 *    replaces its content while loading), and the empty state is
 *    the app's "No meal plans yet." message.
 * 5. There is deliberately no app-content render slot: the audit
 *    recorded in the component header found no app-rendered
 *    content inside the app's list rows. This test pins the
 *    absence so a slot is added by a conscious contract change
 *    (with the cook-log reasoning revisited), not by drift.
 * 6. The component is exported from the pages subpath index, and
 *    stories exercise the Default, Empty, Loading, and
 *    no-actions states so Chromatic captures them.
 *
 * This is a source scan, not a render test: the repo has no JS
 * renderer for these components (Chromatic screenshots in CI),
 * and the invariant is a per-literal property of the source (same
 * rationale as test/recipesPageBoundedList.test.mjs). Comments
 * are stripped before scanning so prose cannot satisfy — or, for
 * the no-slot pin, accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "MealPlansPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MealPlansPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MealPlansPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full MealPlansPage source");
  assert.match(code, /export function MealPlansPage/);
});

test("the shell is the scrolling ScreenContainer, with no FlatList", () => {
  assert.match(
    code,
    /<ScreenContainer>/,
    "MealPlansPage must render the default (scrolling) ScreenContainer shell",
  );
  assert.doesNotMatch(
    code,
    /<FlatList/,
    "the app's plan list is unpaginated and unvirtualized — a FlatList would invent structure it never had",
  );
  assert.doesNotMatch(
    code,
    /scrollable=\{false\}/,
    "the shell must scroll, mirroring the app's ScreenScroll",
  );
});

test("the view-model and callback contract matches the declared props", () => {
  assert.match(code, /plans: MealPlansPageItem\[\];/);
  assert.match(code, /onPlanPress: \(planId: string\) => void;/);
  assert.match(code, /onCreatePlan\?: \(\) => void;/);
  assert.match(code, /onPlanDelete\?: \(planId: string\) => void;/);
  assert.match(
    code,
    /onPlanPress\(plan\.id\)/,
    "row presses must fire onPlanPress with the row's plan id",
  );
  assert.match(
    code,
    /onPlanDelete\(plan\.id\)/,
    "row deletes must fire onPlanDelete with the row's plan id",
  );
});

test("optional actions render only when their callbacks are provided", () => {
  assert.match(
    code,
    /\{onCreatePlan \? \(/,
    "the create button must be guarded by the onCreatePlan prop",
  );
  assert.match(
    code,
    /\{onDeletePress \? \(/,
    "the row Delete button must be guarded by the row's delete wiring",
  );
  assert.match(
    code,
    /onPlanDelete\s*\?\s*\{\s*onDeletePress/,
    "the row's delete wiring must exist only when onPlanDelete is provided",
  );
});

test("loading swaps content before the empty and list branches", () => {
  const loadingAt = code.indexOf("{isLoading ? (");
  const emptyAt = code.indexOf("plans.length === 0");
  const listAt = code.indexOf("plans.map");
  assert.ok(loadingAt !== -1, "the loading branch must key off isLoading");
  assert.ok(emptyAt > loadingAt, "the empty branch must follow the loading branch");
  assert.ok(listAt > emptyAt, "the list branch must follow the empty branch");
  assert.match(code, /<Spinner label="Loading" \/>/, "loading must render the Spinner");
  assert.match(
    code,
    /<EmptyState title="No meal plans yet\." \/>/,
    'the empty state must be the app\'s "No meal plans yet." message',
  );
});

test("there is deliberately no app-content render slot", () => {
  assert.doesNotMatch(
    code,
    /render\w+\?: \(.*\) => ReactNode/,
    "a render slot must be a conscious contract change (see the header audit), not drift",
  );
  assert.doesNotMatch(
    code,
    /ReactNode/,
    "MealPlansPage takes no ReactNode props — all content is DS-rendered from view-models",
  );
});

test("the component is exported from the pages subpath index", () => {
  assert.match(index, /MealPlansPage/);
  assert.match(index, /type MealPlansPageProps/);
  assert.match(index, /from "\.\/MealPlansPage\.js"/);
});

test("stories exercise the default, empty, loading, and no-actions states", () => {
  for (const name of ["Default", "Empty", "Loading", "NoActions"]) {
    assert.match(
      stories,
      new RegExp(`export const ${name}`),
      `MealPlansPage.stories.tsx must export a ${name} story`,
    );
  }
});
