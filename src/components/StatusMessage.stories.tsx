import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StatusMessage } from "./StatusMessage.js";

const meta: Meta<typeof StatusMessage> = {
  title: "Components/StatusMessage",
  component: StatusMessage,
};

export default meta;
type Story = StoryObj<typeof StatusMessage>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <StatusMessage>Version activated</StatusMessage>
    </YStack>
  ),
};
