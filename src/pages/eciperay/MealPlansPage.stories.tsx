import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";

import { eciperayFooterFixture } from "../shared/fixtures.js";
import { storyImageWide } from "../../storyFixtures.js";

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
 * (430×844) by default, so Chromatic screenshots are deterministic and
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

// Subtitles are the app's meta line, pre-composed: entry count,
// then the date range and nutrition summary when the plan has
// them. The set varies them on purpose — one plan with everything,
// one still being built (no dates), one with a single entry.
const planItems: MealPlansPageItem[] = [
  {
    id: "weeknight-dinners",
    href: "/meal-plans/weeknight-dinners",
    title: "Weeknight dinners",
    subtitle: "5 entries · Oct 19 – Oct 25 · 2,140 cal · Protein 118 g",
  },
  {
    id: "meal-prep-sunday",
    href: "/meal-plans/meal-prep-sunday",
    title: "Meal prep Sunday",
    subtitle: "3 entries · Oct 26 – Oct 28",
  },
  {
    id: "holiday-baking",
    href: "/meal-plans/holiday-baking",
    title: "Holiday baking",
    subtitle: "1 entry",
  },
  {
    id: "new-plan-draft",
    href: "/meal-plans/new-plan-draft",
    title: "New plan draft",
    subtitle: "0 entries",
  },
];

export const Default: Story = {
  render: () => (
    <>
      <MealPlansPage
        footer={eciperayFooterFixture}
        plans={planItems}
        loading={false}
        createHref="/meal-plans/new"
        onPlanDelete={() => {}}
      />
    </>
  ),
};

export const WithLeadImage: Story = {
  // Photography-led lead (#852): the host-supplied lead image
  // renders as the hero above the heading.
  render: () => (
    <>
      <MealPlansPage
        footer={eciperayFooterFixture}
        leadImageUrl={storyImageWide}
        plans={planItems}
        loading={false}
        createHref="/meal-plans/new"
        onPlanDelete={() => {}}
      />
    </>
  ),
};

export const Empty: Story = {
  render: () => (
    <>
      <MealPlansPage
        footer={eciperayFooterFixture}
        plans={[]}
        loading={false}
        createHref="/meal-plans/new"
        onPlanDelete={() => {}}
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <MealPlansPage footer={eciperayFooterFixture} plans={[]} loading />
    </>
  ),
};

export const NoActions: Story = {
  // No createHref / onPlanDelete: the create button and the
  // per-row Delete buttons omit cleanly, leaving a read-only list.
  render: () => (
    <>
      <MealPlansPage footer={eciperayFooterFixture} plans={planItems} loading={false} />
    </>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <View position="relative" height="100%">
      <MealPlansPage
        footer={eciperayFooterFixture}
        plans={planItems}
        loading={false}
        createHref="/meal-plans/new"
        onPlanDelete={() => {}}
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
        <MealPlansPage
          footer={eciperayFooterFixture}
          plans={planItems}
          loading
          createHref="/meal-plans/new"
          onPlanDelete={() => {}}
        />
      </View>
    </View>
  ),
};
