import type { Meta, StoryObj } from "@storybook/react";

import { mealDetailFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import { MealDetailPage } from "./MealDetailPage.js";

/**
 * Stories for the real MealDetailPage (#125): the fixture's
 * third member carries the unavailable state (access lost),
 * so the default story pins the suffix + non-pressable row
 * alongside the pressable ones. Theme pinned to Warm
 * Harvest.
 */
const meta: Meta<typeof MealDetailPage> = {
  title: "Pages/Eciperay/MealDetailPage",
  component: MealDetailPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealDetailPage>;

const fixture = mealDetailFixture;

export const Default: Story = {
  render: () => (
    <>
      <MealDetailPage
        footer={eciperayFooterFixture}
        title={fixture.title}
        notes={fixture.notes}
        nutritionLabel={fixture.nutritionLabel}
        members={fixture.members}
        cookHref="/meals/sunday-chicken-dinner/cook"
        editHref="/meals/sunday-chicken-dinner/edit"
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <MealDetailPage
        footer={eciperayFooterFixture}
        title={fixture.title}
        members={[]}
        cookHref="/meals/sunday-chicken-dinner/cook"
        editHref="/meals/sunday-chicken-dinner/edit"
        loading
      />
    </>
  ),
};

export const WithDirectIngredients: Story = {
  render: () => (
    <>
      <MealDetailPage
        footer={eciperayFooterFixture}
        title={fixture.title}
        notes={fixture.notes}
        nutritionLabel={fixture.nutritionLabel}
        members={fixture.members}
        ingredients={fixture.ingredients}
        cookHref="/meals/sunday-chicken-dinner/cook"
        editHref="/meals/sunday-chicken-dinner/edit"
      />
    </>
  ),
};

export const NoNotesOrNutrition: Story = {
  render: () => (
    <>
      <MealDetailPage
        footer={eciperayFooterFixture}
        title={fixture.title}
        members={fixture.members.slice(0, 1)}
        cookHref="/meals/sunday-chicken-dinner/cook"
        editHref="/meals/sunday-chicken-dinner/edit"
      />
    </>
  ),
};
