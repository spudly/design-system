import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { ProfileIcon } from "../icons/ProfileIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";
import { tokens } from "../tokens/index.js";
import { Dropdown } from "./Dropdown.js";
import { DropdownButton } from "./DropdownButton.js";
import { Text } from "./Text.js";

const meta: Meta<typeof DropdownButton> = {
  title: "Components/DropdownButton",
  component: DropdownButton,
};

export default meta;
type Story = StoryObj<typeof DropdownButton>;

function Panel() {
  return (
    <YStack padding={tokens.spacing[2]}>
      <Text>Menu content</Text>
    </YStack>
  );
}

export const Labeled: Story = {
  render: () => (
    <Dropdown accessibilityLabel="Actions" trigger={<DropdownButton label="Actions" />}>
      <Panel />
    </Dropdown>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Share"
      trigger={<DropdownButton label="Share" icon={ShareIcon} />}
    >
      <Panel />
    </Dropdown>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Account menu"
      trigger={<DropdownButton icon={ProfileIcon} accessibilityLabel="Account menu" />}
    >
      <Panel />
    </Dropdown>
  ),
};

export const Variants: Story = {
  render: () => (
    <XStack gap={tokens.spacing[3]}>
      <Dropdown
        accessibilityLabel="Primary"
        trigger={<DropdownButton label="Primary" variant="primary" />}
      >
        <Panel />
      </Dropdown>
      <Dropdown accessibilityLabel="Secondary" trigger={<DropdownButton label="Secondary" />}>
        <Panel />
      </Dropdown>
      <Dropdown
        accessibilityLabel="Ghost"
        trigger={<DropdownButton label="Ghost" variant="ghost" />}
      >
        <Panel />
      </Dropdown>
    </XStack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Unavailable"
      trigger={<DropdownButton label="Unavailable" disabled />}
    >
      <Panel />
    </Dropdown>
  ),
};
