import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { NutritionPanel, type NutritionFacts } from "./NutritionPanel.js";

const meta: Meta<typeof NutritionPanel> = {
  title: "Widgets/Data Display/NutritionPanel",
  component: NutritionPanel,
};

export default meta;
type Story = StoryObj<typeof NutritionPanel>;

// A full FDA-ordered nutrient set (#722), net carbs included as
// the indented sub-row under the carbohydrate group.
const FULL_FACTS: NutritionFacts = {
  servingSizeLabel: "1 cup (240g)",
  servingsPerContainerLabel: "about 2 servings per container",
  caloriesLabel: "520",
  nutrients: [
    { kind: "totalFat", amountLabel: "16g", dailyValueLabel: "21%" },
    { kind: "saturatedFat", amountLabel: "3g", dailyValueLabel: "15%" },
    { kind: "transFat", amountLabel: "0g" },
    { kind: "cholesterol", amountLabel: "65mg", dailyValueLabel: "22%" },
    { kind: "sodium", amountLabel: "640mg", dailyValueLabel: "28%" },
    { kind: "totalCarbohydrate", amountLabel: "48g", dailyValueLabel: "17%" },
    { kind: "dietaryFiber", amountLabel: "6g", dailyValueLabel: "21%" },
    { kind: "totalSugars", amountLabel: "9g" },
    { kind: "addedSugars", amountLabel: "4g", dailyValueLabel: "8%" },
    { kind: "netCarbs", amountLabel: "42g" },
    { kind: "protein", amountLabel: "42g", dailyValueLabel: "84%" },
    { kind: "vitaminD", amountLabel: "2mcg", dailyValueLabel: "10%" },
    { kind: "calcium", amountLabel: "180mg", dailyValueLabel: "15%" },
    { kind: "iron", amountLabel: "3.6mg", dailyValueLabel: "20%" },
    { kind: "potassium", amountLabel: "705mg", dailyValueLabel: "15%" },
  ],
};

const DISCLAIMER = "Estimates are per serving and may vary with substitutions.";

export const Ready: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <NutritionPanel
        nutrition={{
          state: "ready",
          facts: FULL_FACTS,
          disclaimer: DISCLAIMER,
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

// The overlay verifies the skeleton reproduces the label's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <NutritionPanel
        nutrition={{
          state: "ready",
          facts: FULL_FACTS,
          disclaimer: DISCLAIMER,
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
            facts: FULL_FACTS,
            disclaimer: DISCLAIMER,
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
