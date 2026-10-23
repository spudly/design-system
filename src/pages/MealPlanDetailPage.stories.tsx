import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import {
  MealPlanDetailPage,
  type MealPlanDetailPageEntry,
  type MealPlanDetailPageNutritionGoals,
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
 * (430×844) pinned so Chromatic screenshots are deterministic.
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

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

// Mirrors the app's screen fixture shape: one meal entry, one
// recipe entry with nutrition, and one shared recipe whose
// access was lost (disabled, "(unavailable)").
const detailEntries: MealPlanDetailPageEntry[] = [
  {
    id: "entry-sunday-dinner",
    kind: "meal",
    targetId: "meal-sunday-dinner",
    title: "Sunday Dinner",
    subtitle: "Qty 1 · 3 recipes",
  },
  {
    id: "entry-test-recipe",
    kind: "recipe",
    targetId: "recipe-test",
    title: "Test Recipe",
    subtitle: "Qty 1 · 4 servings · 520 cal · Protein 32 g",
  },
  {
    id: "entry-shared-pasta",
    kind: "recipe",
    targetId: "recipe-pasta",
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
    <Viewport>
      <MealPlanDetailPage
        state="ready"
        title="This week"
        notes="Family dinners — keep weeknights simple."
        dateRangeLabel="2026-10-19 – 2026-10-25"
        nutritionLabel="2,140 cal · Protein 118 g"
        nutritionGoals={detailGoals}
        onSetGoalsPress={() => undefined}
        onShoppingListPress={() => undefined}
        onEditPress={() => undefined}
        entries={detailEntries}
        onMealPress={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  // A plan with no entries and no meta beyond its title: the
  // "Entries" section renders bare, as the app renders it — this
  // screen has no empty message.
  render: () => (
    <Viewport>
      <MealPlanDetailPage
        state="ready"
        title="New plan draft"
        onShoppingListPress={() => undefined}
        onEditPress={() => undefined}
        entries={[]}
        onMealPress={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <MealPlanDetailPage state="loading" />
    </Viewport>
  ),
};

export const NutritionUnavailable: Story = {
  // The #78 case: the plan's nutrition data is present but
  // unavailable, so the app passes no summary and no goals —
  // the auto rule would render no goals section at all. The
  // explicit visibility control forces the section so the
  // set-goals hint card renders, as the old app view did.
  render: () => (
    <Viewport>
      <MealPlanDetailPage
        state="ready"
        title="Harvest week"
        dateRangeLabel="2026-10-19 – 2026-10-25"
        goalsSectionVisibility="shown"
        onSetGoalsPress={() => undefined}
        onShoppingListPress={() => undefined}
        onEditPress={() => undefined}
        entries={detailEntries.slice(0, 1)}
        onMealPress={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};

export const NoGoals: Story = {
  // Nutrition summary present but no goals set: the goals
  // section shows the plan total, its set-goals hint, and the
  // "Set nutrition goals" link.
  render: () => (
    <Viewport>
      <MealPlanDetailPage
        state="ready"
        title="Meal prep Sunday"
        dateRangeLabel="2026-10-26 – 2026-10-28"
        nutritionLabel="1,480 cal · Protein 96 g"
        onSetGoalsPress={() => undefined}
        onShoppingListPress={() => undefined}
        onEditPress={() => undefined}
        entries={detailEntries.slice(0, 1)}
        onMealPress={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};
