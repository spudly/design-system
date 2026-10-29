import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MealPlanEntryRow } from "./MealPlanEntryRow.js";

const meta: Meta<typeof MealPlanEntryRow> = {
  title: "Components/MealPlanEntryRow",
  component: MealPlanEntryRow,
};

export default meta;
type Story = StoryObj<typeof MealPlanEntryRow>;

export const Meal: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanEntryRow {...args} />
    </YStack>
  ),
  args: {
    kind: "meal",
    title: "Taco Tuesday",
    subtitle: "Serves 4 · 2,150 cal",
    onPress: () => {},
  },
};

export const Recipe: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanEntryRow {...args} />
    </YStack>
  ),
  args: {
    kind: "recipe",
    title: "Garlic cream chicken",
    onPress: () => {},
  },
};

export const Unavailable: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanEntryRow {...args} />
    </YStack>
  ),
  args: {
    kind: "recipe",
    title: "Shared stew",
    subtitle: "Serves 6",
    isUnavailable: true,
    onPress: () => {},
  },
};
