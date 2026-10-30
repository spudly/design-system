import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { TextActionCardRow } from "./TextActionCardRow.js";

const meta: Meta<typeof TextActionCardRow> = {
  title: "Components/TextActionCardRow",
  component: TextActionCardRow,
};

export default meta;
type Story = StoryObj<typeof TextActionCardRow>;

export const Default: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <TextActionCardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Taco night",
    subtitle: "Beef tacos, elote, lime crema",
    href: "/meals/1",
    actionLabel: "Delete",
    onActionPress: () => {},
  },
};

export const TitleOnly: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <TextActionCardRow {...args} />
    </YStack>
  ),
  args: {
    title: "Soup Sunday",
    href: "/meals/2",
    actionLabel: "Delete",
    onActionPress: () => {},
  },
};
