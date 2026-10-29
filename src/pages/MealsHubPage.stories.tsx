import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealsHubFixture } from "./fixtures.js";
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

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function Hub({ initialTab }: { initialTab: MealsHubPageTab }) {
  const [activeTab, setActiveTab] = useState<MealsHubPageTab>(initialTab);
  return (
    <MealsHubPage
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      meals={mealsHubFixture.meals}
      plans={mealsHubFixture.plans}
      isLoading={false}
      createMealHref="/meals/new"
      createPlanHref="/meal-plans/new"
      onDeleteMeal={() => undefined}
      onDeletePlan={() => undefined}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Hub initialTab="meals" />
    </Viewport>
  ),
};

export const PlansTab: Story = {
  render: () => (
    <Viewport>
      <Hub initialTab="plans" />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <MealsHubPage
        activeTab="meals"
        onSelectTab={() => undefined}
        meals={[]}
        plans={[]}
        isLoading={false}
        createMealHref="/meals/new"
        createPlanHref="/meal-plans/new"
        onDeleteMeal={() => undefined}
        onDeletePlan={() => undefined}
      />
    </Viewport>
  ),
};
