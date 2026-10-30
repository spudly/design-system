import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { StatusBadge } from "./StatusBadge.js";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Tones: Story = {
  render: () => (
    <YStack padding="$4" gap="$3">
      <XStack gap="$2" flexWrap="wrap">
        <StatusBadge tone="neutral" label="Draft" />
        <StatusBadge tone="info" label="In progress" />
        <StatusBadge tone="success" label="Complete" />
        <StatusBadge tone="warning" label="Needs attention" />
        <StatusBadge tone="danger" label="Abandoned" />
      </XStack>
    </YStack>
  ),
};
