import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MealPlanRow } from "./MealPlanRow.js";

const meta: Meta<typeof MealPlanRow> = {
  title: "Components/MealPlanRow",
  component: MealPlanRow,
};

export default meta;
type Story = StoryObj<typeof MealPlanRow>;

export const Default: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanRow {...args} />
    </YStack>
  ),
  args: {
    title: "Weeknight favorites",
    subtitle: "4 entries · Oct 19 – Oct 25 · 12,400 cal",
    onPress: () => {},
  },
};

export const WithDelete: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanRow {...args} />
    </YStack>
  ),
  args: {
    title: "Weeknight favorites",
    subtitle: "4 entries · Oct 19 – Oct 25 · 12,400 cal",
    onPress: () => {},
    onDeletePress: () => {},
  },
};

export const TitleOnly: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <MealPlanRow {...args} />
    </YStack>
  ),
  args: {
    title: "Empty plan",
    onPress: () => {},
  },
};
