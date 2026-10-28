import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { AddIcon } from "../icons/AddIcon.js";
import { PrintIcon } from "../icons/PrintIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";
import { WarningIcon } from "../icons/WarningIcon.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
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
type Story = StoryObj<typeof Button>;

const noop = () => {};

export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Save recipe" },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Cancel" },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "md", children: "Learn more" },
};

export const Danger: Story = {
  args: { variant: "danger", size: "md", children: "Delete recipe" },
};

export const Sizes: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </XStack>
  ),
};

export const Disabled: Story = {
  args: { variant: "primary", size: "md", disabled: true, children: "Saving…" },
};

export const AllVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </XStack>
  ),
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    size: "md",
    icon: PrintIcon,
    children: "Print recipe",
    onPress: noop,
  },
};

export const WithIconVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary" icon={AddIcon} onPress={noop}>
        Add recipe
      </Button>
      <Button variant="secondary" icon={PrintIcon} onPress={noop}>
        Print
      </Button>
      <Button variant="ghost" icon={ShareIcon} onPress={noop}>
        Share
      </Button>
      <Button variant="danger" icon={WarningIcon} onPress={noop}>
        Delete
      </Button>
    </XStack>
  ),
};

export const IconOnly: Story = {
  args: {
    variant: "secondary",
    size: "md",
    icon: PrintIcon,
    accessibilityLabel: "Print recipe",
    onPress: noop,
  },
};

export const IconOnlyVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary" icon={AddIcon} accessibilityLabel="Add recipe" onPress={noop} />
      <Button
        variant="secondary"
        icon={PrintIcon}
        accessibilityLabel="Print recipe"
        onPress={noop}
      />
      <Button variant="ghost" icon={ShareIcon} accessibilityLabel="Share recipe" onPress={noop} />
      <Button
        variant="danger"
        icon={WarningIcon}
        accessibilityLabel="Delete recipe"
        onPress={noop}
      />
    </XStack>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <YStack gap={12}>
      <XStack gap={12} alignItems="center">
        <Button size="sm" icon={PrintIcon} onPress={noop}>
          Print
        </Button>
        <Button size="md" icon={PrintIcon} onPress={noop}>
          Print
        </Button>
        <Button size="lg" icon={PrintIcon} onPress={noop}>
          Print
        </Button>
      </XStack>
      <XStack gap={12} alignItems="center">
        <Button size="sm" icon={PrintIcon} accessibilityLabel="Print recipe" onPress={noop} />
        <Button size="md" icon={PrintIcon} accessibilityLabel="Print recipe" onPress={noop} />
        <Button size="lg" icon={PrintIcon} accessibilityLabel="Print recipe" onPress={noop} />
      </XStack>
    </YStack>
  ),
};

export const IconDisabled: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button icon={PrintIcon} disabled onPress={noop}>
        Print recipe
      </Button>
      <Button icon={PrintIcon} accessibilityLabel="Print recipe" disabled onPress={noop} />
    </XStack>
  ),
};

function IconPressCounterDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack gap={12}>
      <Button
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

export const IconPressCounter: Story = {
  render: () => <IconPressCounterDemo />,
};
