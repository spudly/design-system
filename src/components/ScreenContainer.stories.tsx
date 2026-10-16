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

const verses = [
  "Psalm 23:1",
  "Philippians 4:6–7",
  "Isaiah 40:31",
  "John 3:16",
  "Proverbs 3:5",
  "Psalm 46:1",
  "Romans 8:28",
  "Joshua 1:9",
  "Psalm 121:1–2",
  "Lamentations 3:22–23",
  "2 Timothy 1:7",
  "Psalm 19:14",
  "Micah 6:8",
  "Hebrews 11:1",
];

export const Scrollable: Story = {
  render: (args) => (
    // display:flex + column so the ScrollView's flex:1 can resolve against
    // the fixed height; in a plain block wrapper the scroll region
    // collapses to content height. The content must actually overflow the
    // 400px frame for the story to demonstrate scrolling: 14 cards at
    // ~58px each plus the heading and 16px gaps total ~1100px.
    <div
      style={{ height: 400, border: "1px dashed #ccc", display: "flex", flexDirection: "column" }}
    >
      <ScreenContainer {...args}>
        <Text variant="heading">My verses</Text>
        {verses.map((verse) => (
          <Card key={verse}>
            <Text variant="body">{verse}</Text>
          </Card>
        ))}
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
