import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Button> = {
  title: "Widgets/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger"],
    },
    ghost: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    href: {
      control: "text",
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
  // The ghost PROP composed with each real variant (#463): the
  // background is transparent, there is no border, and the ink
  // matches the variant (primary $primary, secondary gray10,
  // danger danger7).
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button ghost>Ghost primary</Button>
      <Button ghost variant="secondary">
        Ghost secondary
      </Button>
      <Button ghost variant="danger">
        Ghost danger
      </Button>
    </XStack>
  ),
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
      <Button ghost>Ghost</Button>
      <Button variant="danger">Danger</Button>
    </XStack>
  ),
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    size: "md",
    icon: "print",
    children: "Print recipe",
    onPress: noop,
  },
};

export const WithIconVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary" icon="add" onPress={noop}>
        Add recipe
      </Button>
      <Button variant="secondary" icon="print" onPress={noop}>
        Print
      </Button>
      <Button ghost icon="share" onPress={noop}>
        Share
      </Button>
      <Button variant="danger" icon="warning" onPress={noop}>
        Delete
      </Button>
    </XStack>
  ),
};

export const IconOnly: Story = {
  args: {
    variant: "secondary",
    size: "md",
    icon: "print",
    accessibilityLabel: "Print recipe",
    onPress: noop,
  },
};

export const IconOnlyVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary" icon="add" accessibilityLabel="Add recipe" onPress={noop} />
      <Button variant="secondary" icon="print" accessibilityLabel="Print recipe" onPress={noop} />
      <Button ghost icon="share" accessibilityLabel="Share recipe" onPress={noop} />
      <Button variant="danger" icon="warning" accessibilityLabel="Delete recipe" onPress={noop} />
    </XStack>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <YStack gap={12}>
      <XStack gap={12} alignItems="center">
        <Button size="sm" icon="print" onPress={noop}>
          Print
        </Button>
        <Button size="md" icon="print" onPress={noop}>
          Print
        </Button>
        <Button size="lg" icon="print" onPress={noop}>
          Print
        </Button>
      </XStack>
      <XStack gap={12} alignItems="center">
        <Button size="sm" icon="print" accessibilityLabel="Print recipe" onPress={noop} />
        <Button size="md" icon="print" accessibilityLabel="Print recipe" onPress={noop} />
        <Button size="lg" icon="print" accessibilityLabel="Print recipe" onPress={noop} />
      </XStack>
    </YStack>
  ),
};

export const IconDisabled: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button icon="print" disabled onPress={noop}>
        Print recipe
      </Button>
      <Button icon="print" accessibilityLabel="Print recipe" disabled onPress={noop} />
    </XStack>
  ),
};

function IconPressCounterDemo() {
  const [count, setCount] = useState(0);
  return (
    <YStack gap={12}>
      <Button
        icon="add"
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

export const Link: Story = {
  args: { variant: "primary", size: "md", href: "/recipes", children: "Browse recipes" },
};

export const LinkVariants: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button variant="primary" href="/recipes">
        Browse recipes
      </Button>
      <Button variant="secondary" href="/sign-in">
        Sign in
      </Button>
      <Button ghost href="/about">
        Learn more
      </Button>
      <Button variant="danger" href="/account/delete">
        Delete account
      </Button>
    </XStack>
  ),
};

export const LinkSizes: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <Button size="sm" href="/recipes">
        Small
      </Button>
      <Button size="md" href="/recipes">
        Medium
      </Button>
      <Button size="lg" href="/recipes">
        Large
      </Button>
    </XStack>
  ),
};

export const LinkDisabled: Story = {
  args: {
    variant: "primary",
    size: "md",
    href: "/recipes",
    disabled: true,
    children: "Browse recipes",
  },
};

function ToggleDemo() {
  const [picked, setPicked] = useState("1");
  return (
    <YStack gap={12}>
      <XStack gap={8} alignItems="center">
        {["½×", "1×", "2×", "3×"].map((label, index) => {
          const value = String(index + 1);
          return (
            <Button
              key={value}
              variant="secondary"
              size="sm"
              selected={picked === value}
              onPress={() => {
                setPicked(value);
              }}
            >
              {label}
            </Button>
          );
        })}
      </XStack>
      <Text>Selected: {picked}×</Text>
    </YStack>
  );
}

export const Toggle: Story = {
  render: () => <ToggleDemo />,
};

export const ToggleStates: Story = {
  render: () => (
    <XStack gap={8} alignItems="center">
      <Button variant="secondary" size="sm" selected={false} onPress={noop}>
        Unselected
      </Button>
      <Button variant="secondary" size="sm" selected onPress={noop}>
        Selected
      </Button>
      <Button variant="secondary" size="sm" selected disabled onPress={noop}>
        Selected disabled
      </Button>
    </XStack>
  ),
};
