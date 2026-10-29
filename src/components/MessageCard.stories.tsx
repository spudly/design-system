import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MessageCard } from "./MessageCard.js";

const meta: Meta<typeof MessageCard> = {
  title: "Components/MessageCard",
  component: MessageCard,
};

export default meta;
type Story = StoryObj<typeof MessageCard>;

export const Default: Story = {
  render: (args) => (
    <YStack width={640} maxWidth="100%" height={400}>
      <MessageCard {...args} />
    </YStack>
  ),
  args: {
    title: "Recipe not found",
    message: "This recipe may be private or no longer available.",
  },
};
