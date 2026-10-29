import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RecipeOverviewPanel } from "./RecipeOverviewPanel.js";

const meta: Meta<typeof RecipeOverviewPanel> = {
  title: "Components/RecipeOverviewPanel",
  component: RecipeOverviewPanel,
};

export default meta;
type Story = StoryObj<typeof RecipeOverviewPanel>;

export const Default: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <RecipeOverviewPanel
        title="Tuscan Garlic Chicken"
        description="A one-pan weeknight chicken in a garlicky cream sauce with sun-dried tomatoes and spinach."
        status="perfected"
        servingsLabel="4"
        prepTimeLabel="15m"
        cookTimeLabel="30m"
        tags={[
          { id: "dinner", name: "Dinner", color: "orange" },
          { id: "chicken", name: "Chicken", color: "indigo" },
          { id: "one-pan", name: "One pan", color: "teal" },
        ]}
      />
    </YStack>
  ),
};

export const Minimal: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <RecipeOverviewPanel
        title="Weeknight Tomato Pasta"
        status="idea"
        servingsLabel="2"
        tags={[]}
      />
    </YStack>
  ),
};
