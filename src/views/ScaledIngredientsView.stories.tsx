import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { ScaledIngredientsView } from "./ScaledIngredientsView.js";

const meta: Meta<typeof ScaledIngredientsView> = {
  title: "Views/ScaledIngredientsView",
  component: ScaledIngredientsView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ScaledIngredientsView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4" backgroundColor={tokens.colors.gray.gray10}>
      {children}
    </View>
  );
}

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
    <Viewport>
      <ScaledIngredientsView heading={HEADING} lines={LINES} />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <ScaledIngredientsView heading={HEADING} lines={LINES} loading />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};
