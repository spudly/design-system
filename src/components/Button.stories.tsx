import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { Button } from "./Button.js";

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
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

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
