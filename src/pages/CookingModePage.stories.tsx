import { eciperayFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { CookingModePage } from "./CookingModePage.js";

const meta: Meta<typeof CookingModePage> = {
  title: "Pages/Eciperay/CookingModePage",
  component: CookingModePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof CookingModePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const steps = [
  { stepNumber: 1, body: "Heat the oil in a large skillet over medium heat." },
  { stepNumber: 2, body: "Add the chicken and cook until browned on all sides, about 8 minutes." },
  { stepNumber: 3, body: "Stir in the sauce and simmer until thickened." },
];

export const WithIngredientsPanel: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <Viewport>
      <CookingModePage
        footer={eciperayFooterFixture}
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={0}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </Viewport>
  ),
};

export const LastStep: Story = {
  render: () => (
    <Viewport>
      <CookingModePage
        footer={eciperayFooterFixture}
        recipeTitle="Skillet Chicken"
        steps={steps}
        stepIndex={2}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </Viewport>
  ),
};
