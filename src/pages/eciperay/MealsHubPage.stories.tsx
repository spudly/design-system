import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";

import { mealsHubFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import { MealsHubPage, type MealsHubPageTab } from "./MealsHubPage.js";

/**
 * Stories for the real MealsHubPage (#125): the active tab
 * is held by the story, as the app screen holds it. The
 * plans-tab story renders the hub's pinned chrome over the
 * real MealPlansPage, the composition the app screen
 * renders. Theme pinned to Warm Harvest.
 */
const meta: Meta<typeof MealsHubPage> = {
  title: "Pages/Eciperay/MealsHubPage",
  component: MealsHubPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealsHubPage>;

function Hub({ initialTab }: { initialTab: MealsHubPageTab }) {
  const [activeTab, setActiveTab] = useState<MealsHubPageTab>(initialTab);
  return (
    <MealsHubPage
      footer={eciperayFooterFixture}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      meals={mealsHubFixture.meals}
      plans={mealsHubFixture.plans}
      loading={false}
      createMealHref="/meals/new"
      createPlanHref="/meal-plans/new"
      onDeleteMeal={() => {}}
      onDeletePlan={() => {}}
    />
  );
}

export const Default: Story = {
  render: () => (
    <>
      <Hub initialTab="meals" />
    </>
  ),
};

export const PlansTab: Story = {
  render: () => (
    <>
      <Hub initialTab="plans" />
    </>
  ),
};

// #705 regression coverage: a long plan list at narrow width (864 via the
// dsViewportWidth capture-default parameter, #754) —
// the footer must land below the last plan card, never mid-list.
const LONG_PLANS = Array.from({ length: 12 }, (_, i) => ({
  id: `long-plan-${i + 1}`,
  href: `/meal-plans/long-plan-${i + 1}`,
  title: `Meal plan ${i + 1}`,
  subtitle: "7 entries · 2026-11-02 – 2026-11-08",
}));

export const PlansTabLongListNarrow: Story = {
  parameters: { dsViewportWidth: 864 },
  render: () => (
    <MealsHubPage
      footer={eciperayFooterFixture}
      activeTab="plans"
      onSelectTab={() => {}}
      meals={mealsHubFixture.meals}
      plans={LONG_PLANS}
      loading={false}
      createMealHref="/meals/new"
      createPlanHref="/meal-plans/new"
      onDeleteMeal={() => {}}
      onDeletePlan={() => {}}
    />
  ),
};

export const PlansTabLongListNarrowLoading: Story = {
  parameters: { dsViewportWidth: 864 },
  render: () => (
    <MealsHubPage
      footer={eciperayFooterFixture}
      activeTab="plans"
      onSelectTab={() => {}}
      meals={mealsHubFixture.meals}
      plans={LONG_PLANS}
      loading
      createMealHref="/meals/new"
      createPlanHref="/meal-plans/new"
      onDeleteMeal={() => {}}
      onDeletePlan={() => {}}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <>
      <MealsHubPage
        footer={eciperayFooterFixture}
        activeTab="meals"
        onSelectTab={() => {}}
        meals={[]}
        plans={[]}
        loading={false}
        createMealHref="/meals/new"
        createPlanHref="/meal-plans/new"
        onDeleteMeal={() => {}}
        onDeletePlan={() => {}}
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <MealsHubPage
        footer={eciperayFooterFixture}
        activeTab="meals"
        onSelectTab={() => {}}
        meals={[]}
        plans={[]}
        loading
        createMealHref="/meals/new"
        createPlanHref="/meal-plans/new"
        onDeleteMeal={() => {}}
        onDeletePlan={() => {}}
      />
    </>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <View width="100%" height="100%" position="relative">
      <MealsHubPage
        footer={eciperayFooterFixture}
        activeTab="meals"
        onSelectTab={() => {}}
        meals={mealsHubFixture.meals}
        plans={mealsHubFixture.plans}
        loading={false}
        createMealHref="/meals/new"
        createPlanHref="/meal-plans/new"
        onDeleteMeal={() => {}}
        onDeletePlan={() => {}}
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
        <MealsHubPage
          footer={eciperayFooterFixture}
          activeTab="meals"
          onSelectTab={() => {}}
          meals={mealsHubFixture.meals}
          plans={mealsHubFixture.plans}
          loading
          createMealHref="/meals/new"
          createPlanHref="/meal-plans/new"
          onDeleteMeal={() => {}}
          onDeletePlan={() => {}}
        />
      </View>
    </View>
  ),
};
