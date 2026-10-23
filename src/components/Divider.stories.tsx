import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Divider } from "./Divider.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    vertical: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: (args) => (
    <YStack maxWidth={360}>
      <Text variant="body">Psalm 23:1</Text>
      <Divider {...args} style={{ marginTop: 8, marginBottom: 8 }} />
      <Text variant="body">Philippians 4:6–7</Text>
    </YStack>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <XStack alignItems="center" gap={8} height={40}>
      <Text variant="body">30 min</Text>
      <Divider {...args} vertical />
      <Text variant="body">Medium</Text>
      <Divider {...args} vertical />
      <Text variant="body">4.8 stars</Text>
    </XStack>
  ),
};
