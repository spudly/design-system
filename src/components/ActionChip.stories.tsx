import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { PrintIcon } from "../icons/PrintIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";
import { ActionChip } from "./ActionChip.js";

const meta: Meta<typeof ActionChip> = {
  title: "Components/ActionChip",
  component: ActionChip,
};

export default meta;
type Story = StoryObj<typeof ActionChip>;

const noop = () => {};

export const Tones: Story = {
  render: () => (
    <XStack flexWrap="wrap" gap={8} maxWidth={430}>
      <ActionChip tone="neutral" onPress={noop}>
        Edit
      </ActionChip>
      <ActionChip tone="danger" onPress={noop}>
        Delete
      </ActionChip>
      <ActionChip tone="success" onPress={noop}>
        Mark perfected
      </ActionChip>
      <ActionChip tone="primary" onPress={noop}>
        Tweak with AI
      </ActionChip>
      <ActionChip tone="outline" onPress={noop}>
        Add to plan
      </ActionChip>
    </XStack>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <XStack gap={8} maxWidth={430}>
      <ActionChip tone="neutral" size="md" icon={PrintIcon} onPress={noop}>
        Print
      </ActionChip>
      <ActionChip tone="neutral" size="md" icon={ShareIcon} onPress={noop}>
        Share
      </ActionChip>
    </XStack>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <XStack gap={8} maxWidth={430}>
      <ActionChip
        tone="neutral"
        size="md"
        icon={PrintIcon}
        accessibilityLabel="Print recipe"
        onPress={noop}
      />
      <ActionChip
        tone="neutral"
        size="md"
        icon={ShareIcon}
        accessibilityLabel="Share recipe"
        onPress={noop}
      />
    </XStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <YStack gap={8} maxWidth={430}>
      <XStack gap={8}>
        <ActionChip tone="neutral" size="sm" onPress={noop}>
          Refresh
        </ActionChip>
        <ActionChip tone="danger" size="sm" onPress={noop}>
          Delete
        </ActionChip>
      </XStack>
      <XStack gap={8}>
        <ActionChip tone="neutral" size="md" onPress={noop}>
          Edit draft
        </ActionChip>
        <ActionChip tone="danger" size="md" onPress={noop}>
          Delete
        </ActionChip>
      </XStack>
    </YStack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <XStack gap={8} maxWidth={430}>
      <ActionChip tone="success" disabled onPress={noop}>
        Mark perfected
      </ActionChip>
      <ActionChip tone="danger" disabled onPress={noop}>
        Abandon
      </ActionChip>
    </XStack>
  ),
};
