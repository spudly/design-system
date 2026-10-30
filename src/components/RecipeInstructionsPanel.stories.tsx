import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RecipeInstructionsPanel } from "./RecipeInstructionsPanel.js";

const meta: Meta<typeof RecipeInstructionsPanel> = {
  title: "Components/RecipeInstructionsPanel",
  component: RecipeInstructionsPanel,
};

export default meta;
type Story = StoryObj<typeof RecipeInstructionsPanel>;

export const Default: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <RecipeInstructionsPanel
        instructions={[
          {
            id: "step-1",
            stepNumber: 1,
            body: "Season the chicken and sear it in a hot pan until golden, about 5 minutes per side. Set aside.",
          },
          {
            id: "step-2",
            stepNumber: 2,
            body: "In the same pan, soften the garlic and sun-dried tomatoes, then pour in the cream and simmer until slightly thickened.",
          },
          {
            id: "step-3",
            stepNumber: 3,
            body: "Return the chicken to the pan, fold in the spinach until wilted, and serve with Parmesan.",
          },
        ]}
      />
    </YStack>
  ),
};
