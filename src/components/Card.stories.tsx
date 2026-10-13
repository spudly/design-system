import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
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
