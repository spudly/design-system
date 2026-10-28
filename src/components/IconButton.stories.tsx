import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { AddIcon } from "../icons/AddIcon.js";
import { PrintIcon } from "../icons/PrintIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";
import { WarningIcon } from "../icons/WarningIcon.js";
import { IconButton } from "./IconButton.js";
import { Text } from "./Text.js";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    accessibilityLabel: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

const noop = () => {};

export const Print: Story = {
  args: { icon: PrintIcon, accessibilityLabel: "Print recipe", onPress: noop },
};

export const Primary: Story = {
  args: {
    icon: AddIcon,
    accessibilityLabel: "Add recipe",
    onPress: noop,
    variant: "primary",
  },
};

export const Ghost: Story = {
  args: {
    icon: ShareIcon,
    accessibilityLabel: "Share recipe",
    onPress: noop,
    variant: "ghost",
  },
};

export const Danger: Story = {
  args: {
    icon: WarningIcon,
    accessibilityLabel: "Delete recipe",
    onPress: noop,
    variant: "danger",
  },
};

export const Sizes: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <IconButton icon={PrintIcon} accessibilityLabel="Print recipe" size="sm" onPress={noop} />
      <IconButton icon={PrintIcon} accessibilityLabel="Print recipe" size="md" onPress={noop} />
      <IconButton icon={PrintIcon} accessibilityLabel="Print recipe" size="lg" onPress={noop} />
    </XStack>
  ),
};

export const Disabled: Story = {
  args: {
    icon: PrintIcon,
    accessibilityLabel: "Print recipe",
    onPress: noop,
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <IconButton icon={AddIcon} accessibilityLabel="Add recipe" variant="primary" onPress={noop} />
      <IconButton icon={PrintIcon} accessibilityLabel="Print recipe" onPress={noop} />
      <IconButton
        icon={ShareIcon}
        accessibilityLabel="Share recipe"
        variant="ghost"
        onPress={noop}
      />
      <IconButton
        icon={WarningIcon}
        accessibilityLabel="Delete recipe"
        variant="danger"
        onPress={noop}
      />
    </XStack>
  ),
};

function PressCounterDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack gap={12}>
      <IconButton
        icon={AddIcon}
        accessibilityLabel="Add one"
        variant="primary"
        onPress={() => {
          setCount((current) => current + 1);
        }}
      />
      <Text>Pressed {count} times</Text>
    </YStack>
  );
}

export const PressCounter: Story = {
  render: () => <PressCounterDemo />,
};
