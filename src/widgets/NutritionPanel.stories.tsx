import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { NutritionPanel } from "./NutritionPanel.js";

const meta: Meta<typeof NutritionPanel> = {
  title: "Widgets/NutritionPanel",
  component: NutritionPanel,
};

export default meta;
type Story = StoryObj<typeof NutritionPanel>;

export const Ready: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel
        nutrition={{
          state: "ready",
          rows: [
            { label: "Calories", valueLabel: "520 kcal" },
            { label: "Protein", valueLabel: "42 g" },
            { label: "Carbohydrates", valueLabel: "48 g" },
            { label: "Fat", valueLabel: "16 g" },
          ],
          disclaimer: "Estimates are per serving and may vary with substitutions.",
          onRefreshPress: () => {},
        }}
      />
    </YStack>
  ),
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel nutrition={{ state: "loading" }} />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <NutritionPanel
        nutrition={{
          state: "ready",
          rows: [
            { label: "Calories", valueLabel: "520 kcal" },
            { label: "Protein", valueLabel: "42 g" },
            { label: "Carbohydrates", valueLabel: "48 g" },
            { label: "Fat", valueLabel: "16 g" },
          ],
          disclaimer: "Estimates are per serving and may vary with substitutions.",
          onRefreshPress: () => {},
        }}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <NutritionPanel
          nutrition={{
            state: "ready",
            rows: [
              { label: "Calories", valueLabel: "520 kcal" },
              { label: "Protein", valueLabel: "42 g" },
              { label: "Carbohydrates", valueLabel: "48 g" },
              { label: "Fat", valueLabel: "16 g" },
            ],
            disclaimer: "Estimates are per serving and may vary with substitutions.",
            onRefreshPress: () => {},
          }}
          loading
        />
      </YStack>
    </YStack>
  ),
};

export const Unavailable: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel nutrition={{ state: "unavailable", onEstimatePress: () => {} }} />
    </YStack>
  ),
};

export const UnavailableRefreshing: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel
        nutrition={{ state: "unavailable", isRefreshing: true, onEstimatePress: () => {} }}
      />
    </YStack>
  ),
};
