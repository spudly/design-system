import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { StatusMessage } from "./StatusMessage.js";
import { Text } from "./Text.js";

const meta: Meta<typeof StatusMessage> = {
  title: "Components/StatusMessage",
  component: StatusMessage,
};

export default meta;
type Story = StoryObj<typeof StatusMessage>;

/** A transient confirmation, announced politely when it appears. */
export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} gap={tokens.spacing[4]}>
      <StatusMessage message="Recipe saved to your collection." />
    </YStack>
  ),
};

/**
 * No message: nothing is visible, but the live region stays
 * mounted — that is what lets the NEXT message announce. Render
 * StatusMessage unconditionally, exactly like this.
 */
export const Empty: Story = {
  render: () => (
    <YStack maxWidth={430} gap={tokens.spacing[4]}>
      <Text>No message right now — the live region is still mounted above this line.</Text>
      <StatusMessage message={null} />
    </YStack>
  ),
};

/**
 * The transient pattern: an action sets the message, and a screen
 * reader announces it politely without moving focus. Toggle the
 * action and watch the line come and go under the button row.
 */
export const Transient: Story = {
  render: function TransientStory() {
    const [message, setMessage] = useState<string | null>(null);
    return (
      <YStack maxWidth={430} gap={tokens.spacing[4]}>
        <Button
          onPress={() =>
            setMessage((current) => (current === null ? "Added to this week's meal plan." : null))
          }
        >
          Toggle confirmation
        </Button>
        <StatusMessage message={message} />
      </YStack>
    );
  },
};
