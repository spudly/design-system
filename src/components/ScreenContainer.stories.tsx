import type { Meta, StoryObj } from "@storybook/react";
import { ScreenContainer } from "./ScreenContainer.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ScreenContainer> = {
  title: "Components/ScreenContainer",
  component: ScreenContainer,
  argTypes: {
    scrollable: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "padded", "list", "auth"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScreenContainer>;

export const Scrollable: Story = {
  render: (args) => (
    // display:flex + column so the ScrollView's flex:1 can resolve against
    // the fixed height; in a plain block wrapper the scroll region
    // collapses to content height.
    <div
      style={{ height: 400, border: "1px dashed #ccc", display: "flex", flexDirection: "column" }}
    >
      <ScreenContainer {...args}>
        <Text variant="heading">My verses</Text>
        <Card>
          <Text variant="body">Psalm 23:1</Text>
        </Card>
        <Card>
          <Text variant="body">Philippians 4:6–7</Text>
        </Card>
        <Card>
          <Text variant="body">Isaiah 40:31</Text>
        </Card>
        <Card>
          <Text variant="body">John 3:16</Text>
        </Card>
      </ScreenContainer>
    </div>
  ),
};

export const NotScrollable: Story = {
  render: (args) => (
    <ScreenContainer {...args} scrollable={false}>
      <Text variant="heading">Sign in</Text>
      <Text variant="hint">Fixed-height content, no scroll view.</Text>
    </ScreenContainer>
  ),
};

export const Padded: Story = {
  render: (args) => (
    <div
      style={{ height: 400, border: "1px dashed #ccc", display: "flex", flexDirection: "column" }}
    >
      <ScreenContainer {...args} variant="padded">
        <Text variant="heading">Creamy Tuscan Garlic Chicken</Text>
        <Text variant="hint">Wider horizontal padding and a larger top offset.</Text>
      </ScreenContainer>
    </div>
  ),
};

export const List: Story = {
  render: (args) => (
    <div style={{ height: 400, border: "1px dashed #ccc" }}>
      <ScreenContainer {...args} variant="list" scrollable={false}>
        <Text variant="body">Flush shell — the list manages its own padding.</Text>
        <Card>
          <Text variant="body">Row one</Text>
        </Card>
        <Card>
          <Text variant="body">Row two</Text>
        </Card>
      </ScreenContainer>
    </div>
  ),
};

export const Auth: Story = {
  render: (args) => (
    <div style={{ height: 400, border: "1px dashed #ccc" }}>
      <ScreenContainer {...args} variant="auth" scrollable={false}>
        <Text variant="heading">Welcome back</Text>
        <Text variant="hint">Surface shell with the large auth top offset.</Text>
      </ScreenContainer>
    </div>
  ),
};
