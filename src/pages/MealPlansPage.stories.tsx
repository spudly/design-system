import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { MealPlansPage, type MealPlansPageItem } from "./MealPlansPage.js";

/**
 * Stories for the real MealPlansPage component (#49) — not a
 * made-up page composition: this renders the same component the
 * Eciperay app will consume, driven by fixture props. It succeeds
 * the Meal plans demo in Pages/Eciperay (#44); that demo imagined
 * a week grid the real app never had, so its fixtures do NOT carry
 * over — the fixtures below mirror the real hub rows' meta lines
 * (entry count · date range · nutrition), pre-composed by the app
 * in production and written out here.
 *
 * The frame matches RecipesPage's stories: a phone viewport
 * (430×844) pinned so Chromatic screenshots are deterministic and
 * the scrolling shell bounds the way it does on device. Theme
 * pinned to Warm Harvest, Eciperay's brand, like Pages/Eciperay.
 */
const meta: Meta<typeof MealPlansPage> = {
  title: "Pages/Eciperay/MealPlansPage",
  component: MealPlansPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealPlansPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

// Subtitles are the app's meta line, pre-composed: entry count,
// then the date range and nutrition summary when the plan has
// them. The set varies them on purpose — one plan with everything,
// one still being built (no dates), one with a single entry.
const planItems: MealPlansPageItem[] = [
  {
    id: "weeknight-dinners",
    title: "Weeknight dinners",
    subtitle: "5 entries · Oct 19 – Oct 25 · 2,140 cal · Protein 118 g",
  },
  {
    id: "meal-prep-sunday",
    title: "Meal prep Sunday",
    subtitle: "3 entries · Oct 26 – Oct 28",
  },
  { id: "holiday-baking", title: "Holiday baking", subtitle: "1 entry" },
  { id: "new-plan-draft", title: "New plan draft", subtitle: "0 entries" },
];

export const Default: Story = {
  render: () => (
    <Viewport>
      <MealPlansPage
        plans={planItems}
        isLoading={false}
        onPlanPress={() => undefined}
        onCreatePlan={() => undefined}
        onPlanDelete={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <MealPlansPage
        plans={[]}
        isLoading={false}
        onPlanPress={() => undefined}
        onCreatePlan={() => undefined}
        onPlanDelete={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <MealPlansPage plans={[]} isLoading onPlanPress={() => undefined} />
    </Viewport>
  ),
};

export const NoActions: Story = {
  // No onCreatePlan / onPlanDelete: the create button and the
  // per-row Delete buttons omit cleanly, leaving a read-only list.
  render: () => (
    <Viewport>
      <MealPlansPage plans={planItems} isLoading={false} onPlanPress={() => undefined} />
    </Viewport>
  ),
};
