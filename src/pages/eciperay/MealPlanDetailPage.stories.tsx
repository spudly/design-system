import { eciperayFooterFixture } from "../shared/fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import {
  MealPlanDetailPage,
  type MealPlanDetailPageDay,
  type MealPlanDetailPageEntry,
  type MealPlanDetailPageNutritionGoals,
  type MealPlanDetailPageWeeklyTotals,
} from "./MealPlanDetailPage.js";

/**
 * Stories for the real MealPlanDetailPage component (#49) — not
 * a made-up page composition: this renders the same component
 * the Eciperay app will consume, driven by fixture props. The
 * #44 Pages/Eciperay MealPlans demo imagined a week grid for the
 * meal-plans surface; the real detail screen is a flat entry
 * list under the plan's meta, and these fixtures mirror the real
 * view's lines — entry subtitles (quantity · members/servings ·
 * nutrition), the goal rows' value labels, and the date range
 * are pre-composed by the app in production and written out
 * here.
 *
 * The frame matches MealPlansPage's stories: a phone viewport
 * (430×844) by default, so Chromatic screenshots are deterministic.
 * Theme pinned to Warm Harvest, Eciperay's brand.
 *
 * There is no NotFound story: the app screen has no not-found
 * state (a missing plan stays on its loading gate), so the
 * component's state union has no such member — see the
 * component header.
 */
const meta: Meta<typeof MealPlanDetailPage> = {
  title: "Pages/Eciperay/MealPlanDetailPage",
  component: MealPlanDetailPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealPlanDetailPage>;

// Mirrors the app's screen fixture shape: one meal entry, one
// recipe entry with nutrition, and one shared recipe whose
// access was lost (disabled, "(unavailable)").
const detailEntries: MealPlanDetailPageEntry[] = [
  {
    id: "entry-sunday-dinner",
    kind: "meal",
    targetId: "meal-sunday-dinner",
    href: "/meals/meal-sunday-dinner",
    title: "Sunday Dinner",
    subtitle: "Qty 1 · 3 recipes",
  },
  {
    id: "entry-test-recipe",
    kind: "recipe",
    targetId: "recipe-test",
    href: "/recipes/recipe-test",
    title: "Test Recipe",
    subtitle: "Qty 1 · 4 servings · 520 cal · Protein 32 g",
  },
  {
    id: "entry-shared-pasta",
    kind: "recipe",
    targetId: "recipe-pasta",
    href: "/recipes/recipe-pasta",
    title: "Shared Pasta Bake",
    subtitle: "Qty 2 · 6 servings",
    isUnavailable: true,
  },
];

const detailGoals: MealPlanDetailPageNutritionGoals = {
  rows: [
    { label: "Calories", valueLabel: "1850 / 2000 · On track" },
    { label: "Protein", valueLabel: "118 / 120 · On track" },
    { label: "Satiety", valueLabel: "62 / 60 · Above goal" },
  ],
};

export const Default: Story = {
  render: () => (
    <>
      <MealPlanDetailPage
        footer={eciperayFooterFixture}
        state="ready"
        title="This week"
        notes="Family dinners — keep weeknights simple."
        dateRangeLabel="2026-10-19 – 2026-10-25"
        nutritionLabel="2,140 cal · Protein 118 g"
        nutritionGoals={detailGoals}
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
      />
    </>
  ),
};

// The #414 band's fixture: weekly totals and per-day averages
// for the plan's nutrition fields, as the app composes them
// from servings eaten (averages over the days with entries).
const detailWeeklyTotals: MealPlanDetailPageWeeklyTotals = {
  totals: [
    { label: "Calories", valueLabel: "12,950 cal" },
    { label: "Protein", valueLabel: "826 g" },
    { label: "Fiber", valueLabel: "154 g" },
  ],
  averages: [
    { label: "Calories", valueLabel: "1,850 cal / day" },
    { label: "Protein", valueLabel: "118 g / day" },
    { label: "Fiber", valueLabel: "22 g / day" },
  ],
};

export const WeeklyTotals: Story = {
  // The weekly-totals band populated: each field renders its
  // weekly-total row paired with its daily-average row in the
  // "Weekly totals" section, beside the goals section. Every
  // other story omits the prop — the band renders only when
  // the caller supplies it.
  render: () => (
    <>
      <MealPlanDetailPage
        state="ready"
        title="This week"
        notes="Family dinners — keep weeknights simple."
        dateRangeLabel="2026-10-19 – 2026-10-25"
        nutritionLabel="2,140 cal · Protein 118 g"
        nutritionGoals={detailGoals}
        weeklyTotals={detailWeeklyTotals}
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
      />
    </>
  ),
};

// The #660 week view's fixture: the host groups the plan's
// entries by day and computes each day's totals from servings
// eaten, as pre-labelled rows plus the day's satiety label.
const weekDays: MealPlanDetailPageDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((label, index) => ({
  id: `day-${label.toLowerCase()}`,
  label,
  dateLabel: `2026-10-${19 + index}`,
  entries: detailEntries.slice(0, (index % 3) + 1),
  dailyTotals: [
    { label: "Calories", valueLabel: "1,850 cal" },
    { label: "Protein", valueLabel: "118 g" },
    { label: "Carbs", valueLabel: "190 g" },
    { label: "Fat", valueLabel: "62 g" },
  ],
  satietyLabel: "62",
}));

export const WeekView: Story = {
  // The week view populated: the Entries section renders one
  // column per supplied day, each with its entries and its
  // per-day totals + satiety below them, instead of the flat
  // list. The weekly-totals band still renders above it.
  render: () => (
    <>
      <MealPlanDetailPage
        state="ready"
        title="This week"
        notes="Family dinners — keep weeknights simple."
        dateRangeLabel="2026-10-19 – 2026-10-25"
        nutritionLabel="2,140 cal · Protein 118 g"
        nutritionGoals={detailGoals}
        weeklyTotals={detailWeeklyTotals}
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
        weekView={{ days: weekDays }}
      />
    </>
  ),
};

export const NonSevenDay: Story = {
  // A 3-day plan: the week view renders exactly the days the
  // host supplies — no columns are invented to fill a week.
  render: () => (
    <>
      <MealPlanDetailPage
        state="ready"
        title="Long weekend"
        dateRangeLabel="2026-10-23 – 2026-10-25"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
        weekView={{ days: weekDays.slice(4) }}
      />
    </>
  ),
};

export const EmptyDay: Story = {
  // A supplied day with no entries still gets its column, with
  // its empty-state line and the totals rows the host passed.
  render: () => (
    <>
      <MealPlanDetailPage
        state="ready"
        title="This week"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
        weekView={{
          days: [
            {
              id: "day-monday",
              label: "Monday",
              dateLabel: "2026-10-19",
              entries: detailEntries.slice(0, 1),
              dailyTotals: [
                { label: "Calories", valueLabel: "1,850 cal" },
                { label: "Protein", valueLabel: "118 g" },
              ],
              satietyLabel: "62",
            },
            {
              id: "day-empty",
              label: "Tuesday",
              dateLabel: "2026-10-20",
              entries: [],
              dailyTotals: [
                { label: "Calories", valueLabel: "0 cal" },
                { label: "Protein", valueLabel: "0 g" },
              ],
            },
          ],
        }}
      />
    </>
  ),
};

export const Empty: Story = {
  // A plan with no entries and no meta beyond its title: the
  // "Entries" section renders bare, as the app renders it — this
  // screen has no empty message.
  render: () => (
    <>
      <MealPlanDetailPage
        footer={eciperayFooterFixture}
        state="ready"
        title="New plan draft"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={[]}
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <MealPlanDetailPage footer={eciperayFooterFixture} state="loading" />
    </>
  ),
};

export const NutritionUnavailable: Story = {
  // The #78 case: the plan's nutrition data is present but
  // unavailable, so the app passes no summary and no goals —
  // the auto rule would render no goals section at all. The
  // explicit visibility control forces the section so the
  // set-goals hint card renders, as the old app view did.
  render: () => (
    <>
      <MealPlanDetailPage
        footer={eciperayFooterFixture}
        state="ready"
        title="Harvest week"
        dateRangeLabel="2026-10-19 – 2026-10-25"
        goalsSectionVisibility="shown"
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries.slice(0, 1)}
      />
    </>
  ),
};

export const NoGoals: Story = {
  // Nutrition summary present but no goals set: the goals
  // section shows the plan total, its set-goals hint, and the
  // "Set nutrition goals" link.
  render: () => (
    <>
      <MealPlanDetailPage
        footer={eciperayFooterFixture}
        state="ready"
        title="Meal prep Sunday"
        dateRangeLabel="2026-10-26 – 2026-10-28"
        nutritionLabel="1,480 cal · Protein 96 g"
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries.slice(0, 1)}
      />
    </>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <View position="relative" height="100%">
      <MealPlanDetailPage
        footer={eciperayFooterFixture}
        state="ready"
        title="This week"
        notes="Family dinners — keep weeknights simple."
        dateRangeLabel="2026-10-19 – 2026-10-25"
        nutritionLabel="2,140 cal · Protein 118 g"
        nutritionGoals={detailGoals}
        goalsHref="/meal-plans/this-week/goals"
        shoppingListHref="/meal-plans/this-week/shopping-list"
        editHref="/meal-plans/this-week/edit"
        entries={detailEntries}
      />
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <MealPlanDetailPage footer={eciperayFooterFixture} state="loading" />
      </View>
    </View>
  ),
};
