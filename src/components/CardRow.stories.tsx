import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CardRow } from "./CardRow.js";

const meta: Meta<typeof CardRow> = {
  title: "Components/CardRow",
  component: CardRow,
};

export default meta;
type Story = StoryObj<typeof CardRow>;

export const Default: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <CardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Weeknight favorites",
    subtitle: "4 entries · Oct 19 – Oct 25 · 12,400 cal",
    onPress: () => {},
  },
};

export const WithAction: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <CardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Weeknight favorites",
    subtitle: "4 entries · Oct 19 – Oct 25 · 12,400 cal",
    onPress: () => {},
    actionLabel: "Delete",
    actionTone: "danger",
    onActionPress: () => {},
  },
};

export const TitleOnly: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <CardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Empty plan",
    onPress: () => {},
  },
};
