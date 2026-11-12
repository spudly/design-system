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
 *    and Edit buttons, entry rows, and the goals section's
 *    set-goals link. There is deliberately no delete callback —
 *    deleting a plan is the list row's action, and adding or
 *    removing entries happens on the plan form screen. Since
 *    #248's navigation rule, every one of those controls
 *    navigates, so they cross as hrefs (the buttons' href
 *    forms, the rows through ListRow's link form, the set-goals
 *    TextLink's href form), not press callbacks.
 * 4. Entries carry two id spaces: the entry's own `id` (the row
 *    key) and the `targetId` the host composes the entry's
 *    `href` from, because a plan can hold the same recipe twice
 *    and meal/recipe rows navigate to different screens. A
 *    recipe entry with lost access renders its "(unavailable)"
 *    suffix and renders as plain content, not a link.
 * 5. The nutrition-goals section is view-modeled, not slotted:
 *    it renders when the plan has goal progress or a nutrition
 *    summary, shows the set-goals hint when no goals are set,
 *    and its link renders only with goalsHref. The absence
 *    of any render slot is pinned (the header's audit: the app's
 *    goal view is pure presentation over data). Since #78 the
 *    section also carries an explicit visibility control
 *    (`goalsSectionVisibility`, default "auto" = the rule above)
 *    so the present-but-unavailable nutrition case can force
 *    the hint-only section.
 * 6. An entry-less plan renders the bare "Entries" section —
 *    this screen has no empty message, unlike the list pages.
 * 7. The component is exported from the pages barrel index,
 *    and stories exercise the Default, Empty, Loading, NoGoals,
 *    NutritionUnavailable (#78), and WeeklyTotals (#414) states
 *    so Chromatic captures them.
 * 9. The weekly-totals band (#414) is an optional view-model
 *    prop: the app supplies per-field weekly-total and
 *    per-day-average rows as pre-labelled `{ label, valueLabel }`
 *    rows, the band pairs them per field in its own "Weekly
 *    totals" section with the row kinds plainly labelled, and
 *    it renders nothing when the prop is omitted, null, or
 *    empty — the page then renders exactly as before.
 * 8. The page carries no styling of its own (#119, tranche 2):
 *    the loading state is a skeleton composition (#278 tranche 4), the entry
 *    rows are the generic ListRow widget (its pressable area,
 *    hairline, and disabled treatment live there — pinned in
 *    src/widgets/ListRow.test.ts; the page supplies the kind prefix,
 *    the unavailable suffix, and the disabled flag as content),
 *    the goal rows are DetailRow
 *    widgets, the plan title takes Text's `title` variant, the
 *    meta lines take its `hint` variant, and the section spacing
 *    rides the SectionStack. The page's only entry logic is the
 *    kind prefix it composes and the href it passes through.
 *
 * This is a source scan, not a render test: the repo has no JS
 * renderer for these components (Chromatic screenshots in CI),
 * and the invariant is a per-literal property of the source (same
 * rationale as src/pages/MealPlansPage.test.ts). Comments are
 * stripped before scanning so prose cannot satisfy — or, for the
 * pinned absences, accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "../..", "src", "pages");
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
  assert.match(
    code,
    /export type MealPlanDetailPageProps =\s+\{ state: "loading"; footer\?: BigFooterData \} \| MealPlanDetailPageReadyProps;/,
  );
  assert.match(
    code,
    /props\.state === "loading"/,
    "the loading branch must key off the state union",
  );
  assert.match(
    code,
    /<LoadingScope active>[\s\S]*?<SectionCard title="Entries" loading>/,
    "the loading state must render the skeleton composition in a LoadingScope (#278 tranche 4)",
  );
  assert.ok(!code.includes("Spinner"), "the loading state renders skeletons, not a Spinner (#278)");
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

test("the view-model and href contract matches the declared props", () => {
  assert.match(code, /title: string;/);
  assert.match(code, /entries: MealPlanDetailPageEntry\[\];/);
  assert.match(code, /shoppingListHref: string;/);
  assert.match(code, /editHref: string;/);
  assert.match(code, /goalsHref\?: string;/);
  assert.match(code, /nutritionGoals\?: MealPlanDetailPageNutritionGoals \| null;/);
  assert.doesNotMatch(
    code,
    /onMealPress|onRecipePress|onShoppingListPress|onEditPress|onSetGoalsPress/,
    "every control on this page navigates — #248 leaves no press callbacks behind",
  );
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

test("entry rows are links carrying the entry href, by kind", () => {
  assert.match(
    code,
    /<ListRow[\s\S]*?href=\{entry\.href\}/,
    "entry rows must render through ListRow in its link form, carrying the entry's href (the link rendering itself is pinned in src/widgets/ListRow.test.ts)",
  );
  assert.match(code, /kind: "meal" \| "recipe";/, "entries must carry their kind");
  assert.match(
    code,
    /targetId: string;/,
    "entries must carry the host's href source separately from the row key",
  );
  assert.match(code, /href: string;/, "entries must carry their pre-composed href");
});

test("entries render through ListRow, with the kind prefix and availability as content", () => {
  assert.match(
    code,
    /<ListRow/,
    "entry rows must render through the ListRow widget — its disabled state and link wiring are pinned in src/widgets/ListRow.test.ts",
  );
  assert.match(
    code,
    /prefix=\{entry\.kind === "meal" \? "Meal · " : "Recipe · "\}/,
    "the kind lead-in must cross as the row's caller-supplied prefix",
  );
  assert.match(code, /" \(unavailable\)"/, "the access-lost suffix must render on the title line");
  assert.match(
    code,
    /entry\.kind === "recipe" && entry\.isUnavailable\s+\? \{ isDisabled: true, titleSuffix: " \(unavailable\)" \}/,
    "only a recipe entry can be unavailable — it passes the generic disabled flag and the suffix as content (a disabled ListRow renders no link, so the unavailable row is not a link)",
  );
  assert.match(code, /title=\{entry\.title\}/, "the row must receive the entry's title");
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
    /\{goalsHref \? <TextLink/,
    "the set-goals link must render only when its href is provided",
  );
  assert.match(
    code,
    /<TextLink href=\{goalsHref\}>Set nutrition goals<\/TextLink>/,
    "the link label must match the app's, in TextLink's href form (#248)",
  );
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

test("the component is exported from the pages barrel index", () => {
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

test("the page carries no styling of its own (#119)", () => {
  // Compact split form (the pageWebAria pattern): the banned list
  // cannot grow one-per-line without tripping the line caps.
  const banned =
    "XStack,YStack,style={,className,fontSize=,fontWeight=,color=,backgroundColor=,marginBottom,paddingBottom,paddingBlockEnd,paddingBlockStart,paddingVertical,borderBottom,flexWrap,cursor=,function GoalRow,<GoalRow".split(
      ",",
    );
  for (const item of banned) {
    assert.ok(
      !code.includes(item),
      `MealPlanDetailPage must not contain "${item}" — layout and row treatments live in SectionStack / ButtonRow / ListRow / ListStack / DetailRow since the #119 tranche-2 fix`,
    );
  }
  assert.match(
    code,
    /<Text variant="title">\{title\}<\/Text>/,
    "the plan title must take the title variant",
  );
});

test("the weekly-totals band is an optional view-model prop (#414)", () => {
  assert.match(
    code,
    /weeklyTotals\?: MealPlanDetailPageWeeklyTotals \| null;/,
    "the band's data must cross as one optional prop on the ready props, null included so hosts can pass their nullable query result straight through",
  );
  assert.match(
    code,
    /export type MealPlanDetailPageWeeklyTotalsRow = \{/,
    "band rows must be their own view-model type",
  );
  assert.match(code, /totals: MealPlanDetailPageWeeklyTotalsRow\[\];/);
  assert.match(code, /averages: MealPlanDetailPageWeeklyTotalsRow\[\];/);
  assert.match(
    index,
    /type MealPlanDetailPageWeeklyTotals,/,
    "the band's view-model type must be exported from the pages barrel index",
  );
  assert.match(index, /type MealPlanDetailPageWeeklyTotalsRow/);
});

test("the band renders both row kinds labelled, paired per field (#414)", () => {
  assert.match(
    code,
    /weeklyTotalsBand\.length > 0 \? \(/,
    "the band section must be guarded on having at least one row",
  );
  assert.match(
    code,
    /<SectionCard title="Weekly totals">/,
    "the band must render as its own Weekly totals section",
  );
  assert.match(
    code,
    /\$\{total\.label\} · Weekly total/,
    "each field's weekly-total row label must name its kind",
  );
  assert.match(
    code,
    /· Daily average/,
    "each field's per-day-average row label must name its kind",
  );
  assert.match(
    code,
    /weeklyTotals\.averages\.find\(\(row\) => row\.label === total\.label\)/,
    "the rows must pair per field — each total followed by the average carrying the same field label",
  );
  assert.match(
    code,
    /<DetailRow key=\{row\.key\} label=\{row\.label\} value=\{row\.valueLabel\} \/>/,
    "band rows must render through DetailRow, like the goal rows",
  );
});

test("the band is absent when weeklyTotals is omitted, null, or empty (#414)", () => {
  assert.match(
    code,
    /const weeklyTotalsBand = weeklyTotals\s+\? \[/,
    "an omitted or null prop must collapse to an empty band row list",
  );
  assert.match(
    code,
    /: \[\];/,
    "the no-prop case must produce the empty band, so the length guard above renders no section",
  );
  assert.match(stories, /export const WeeklyTotals/, "a story must exercise the populated band");
  assert.match(
    stories,
    /weeklyTotals=\{detailWeeklyTotals\}/,
    "the WeeklyTotals story must pass the band's view-model",
  );
  assert.match(stories, /totals: \[/, "the story fixture must carry weekly-total rows");
  assert.match(stories, /averages: \[/, "the story fixture must carry per-day-average rows");
});

test("the page composes through the purpose-named layout components (#119)", () => {
  assert.match(
    code,
    /<SectionStack>/,
    "the page's blocks must be children of one SectionStack, whose gap owns every section separation",
  );
  assert.match(code, /<ButtonRow>/, "the action bar must compose through ButtonRow");
  assert.match(
    code,
    /<ListStack>/,
    "the entry rows must compose as one ListStack inside the Entries card (SectionCard spaces its own children; the rows own theirs)",
  );
});
