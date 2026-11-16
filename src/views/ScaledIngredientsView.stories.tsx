import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ScaledIngredientsView } from "./ScaledIngredientsView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof ScaledIngredientsView> = {
  title: "Views/ScaledIngredientsView",
  component: ScaledIngredientsView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ScaledIngredientsView>;

const HEADING = "Ingredients · 4 servings (scaled ×2)";
const LINES = [
  "2 lb chicken thighs",
  "2 tbsp olive oil",
  "1 cup tomato sauce",
  "1 tsp smoked paprika",
  "1/2 tsp salt",
];

export const OnOverlay: Story = {
  render: () => (
    <StoryFrame variant="overlayPanel">
      <ScaledIngredientsView heading={HEADING} lines={LINES} />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="overlayPanel">
      <ScaledIngredientsView heading={HEADING} lines={LINES} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="overlayPanel">
      <YStack position="relative">
        <ScaledIngredientsView heading={HEADING} lines={LINES} />
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <ScaledIngredientsView heading={HEADING} lines={LINES} loading />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
