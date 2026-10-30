import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MessageCard } from "./MessageCard.js";

const meta: Meta<typeof MessageCard> = {
  title: "Components/MessageCard",
  component: MessageCard,
  decorators: [
    (Story) => (
      <YStack width={430} maxWidth="100%" height={640}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageCard>;

export const Default: Story = {
  args: {
    title: "Page not found",
    message: "This page may have moved or no longer exists.",
  },
};

export const LongMessage: Story = {
  args: {
    title: "This link has expired",
    message:
      "The link you followed is no longer valid. Ask the person who shared it to send a fresh one, or start again from the home page.",
  },
};
