import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { NutritionPanel } from "./NutritionPanel.js";

const meta: Meta<typeof NutritionPanel> = {
  title: "Components/NutritionPanel",
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

export const Unavailable: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel nutrition={{ state: "unavailable", onEstimatePress: () => {} }} />
    </YStack>
  ),
};
