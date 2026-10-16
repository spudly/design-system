import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "muted", "elevated"],
    },
    elevated: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Text variant="subheading">Psalm 23:1</Text>
      <Text variant="body">The LORD is my shepherd; I shall not want.</Text>
    </Card>
  ),
};

export const Elevated: Story = {
  render: (args) => (
    <Card {...args} elevated style={{ maxWidth: 360 }}>
      <Text variant="subheading">Creamy Tuscan Garlic Chicken</Text>
      <Text variant="hint">30 min · Medium · 4.8 stars</Text>
    </Card>
  ),
};

export const Bordered: Story = {
  render: (args) => (
    <Card {...args} variant="bordered" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Outline only</Text>
      <Text variant="body">No surface fill — content sits on the page background.</Text>
    </Card>
  ),
};

export const Muted: Story = {
  render: (args) => (
    <Card {...args} variant="muted" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Recessed section</Text>
      <Text variant="body">Page-background fill with no border.</Text>
    </Card>
  ),
};

export const ElevatedVariant: Story = {
  render: (args) => (
    <Card {...args} variant="elevated" style={{ maxWidth: 360 }}>
      <Text variant="subheading">Raised section</Text>
      <Text variant="hint">Same look as the legacy `elevated` boolean.</Text>
    </Card>
  ),
};
