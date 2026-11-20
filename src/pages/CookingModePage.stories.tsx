import { eciperayFooterFixture } from "./fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { CookingModePage } from "./CookingModePage.js";

const meta: Meta<typeof CookingModePage> = {
  title: "Pages/Eciperay/CookingModePage",
  component: CookingModePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof CookingModePage>;

const steps = [
  { stepNumber: 1, body: "Heat the oil in a large skillet over medium heat." },
  { stepNumber: 2, body: "Add the chicken and cook until browned on all sides, about 8 minutes." },
  { stepNumber: 3, body: "Stir in the sauce and simmer until thickened." },
];

export const WithIngredientsPanel: Story = {
  render: () => (
    <>
      <CookingModePage
        footer={eciperayFooterFixture}
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={1}
        ingredients={{
          heading: "Ingredients · 4 servings (scaled ×2)",
          lines: [
            "2 lb chicken thighs",
            "2 tbsp olive oil",
            "1 cup tomato sauce",
            "1 tsp smoked paprika",
          ],
        }}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </>
  ),
};

/**
 * The host composition that broke in #729: the eciperay host
 * supplies NO footer data, so the shell's web no-footer branch
 * renders — the overlay must still cover the full viewport.
 */
export const NoFooter: Story = {
  render: () => (
    <>
      <CookingModePage
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={1}
        ingredients={{
          heading: "Ingredients · 4 servings (scaled ×2)",
          lines: [
            "2 lb chicken thighs",
            "2 tbsp olive oil",
            "1 cup tomato sauce",
            "1 tsp smoked paprika",
          ],
        }}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <>
      <CookingModePage
        footer={eciperayFooterFixture}
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={0}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </>
  ),
};

export const LastStep: Story = {
  render: () => (
    <>
      <CookingModePage
        footer={eciperayFooterFixture}
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={2}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </>
  ),
};
