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
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
      />
    </>
  ),
};

/**
 * The #729 regression pin, kept under the #752 full-screen
 * frame: with no footer anywhere in the composition, the
 * overlay must still cover the full viewport.
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
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <CookingModePage
        recipeTitle="Skillet Chicken"
        steps={[]}
        stepIndex={0}
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
        loading
      />
    </>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <>
      <CookingModePage
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={0}
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
      />
    </>
  ),
};

/**
 * The cook-log form open (#871): the host passes `cookLogForm`
 * data (from its Done handling), and the page replaces the
 * step view with the dark RatingForm — a valid step sits
 * underneath, so the capture proves the form replaces it.
 */
export const CookLogFormOpen: Story = {
  render: () => (
    <>
      <CookingModePage
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={1}
        cookLogForm={{
          onSubmit: () => {},
          onSkip: () => {},
          isPending: false,
        }}
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
      />
    </>
  ),
};

export const LastStep: Story = {
  render: () => (
    <>
      <CookingModePage
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={2}
        onPrev={() => {}}
        onNext={() => {}}
        onDone={() => {}}
      />
    </>
  ),
};
