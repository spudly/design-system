import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ListRow } from "./ListRow.js";

const meta: Meta<typeof ListRow> = {
  title: "Components/ListRow",
  component: ListRow,
};

export default meta;
type Story = StoryObj<typeof ListRow>;

export const Prefixed: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    prefix: "Meal · ",
    title: "Taco Tuesday",
    subtitle: "Serves 4 · 2,150 cal",
    onPress: () => {},
  },
};

export const Plain: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    title: "Garlic cream chicken",
    onPress: () => {},
  },
};

export const Disabled: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <ListRow {...args} />
    </YStack>
  ),
  args: {
    prefix: "Recipe · ",
    title: "Shared stew",
    titleSuffix: " (unavailable)",
    subtitle: "Serves 6",
    isDisabled: true,
    onPress: () => {},
  },
};
