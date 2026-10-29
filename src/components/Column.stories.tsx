import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { Column } from "./Column.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Column> = {
  title: "Components/Column",
  component: Column,
  argTypes: {
    spacing: { control: "select", options: ["none", "sm", "md", "lg", "xl", "2xl"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
    spaceBefore: { control: "select", options: ["none", "sm", "md", "lg", "xl", "2xl"] },
    spaceAfter: { control: "select", options: ["none", "sm", "md", "lg", "xl", "2xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof Column>;

export const Stacked: Story = {
  render: (args) => (
    <YStack maxWidth={360}>
      <Column {...args}>
        <Button>Shopping list</Button>
        <Button variant="secondary">Edit</Button>
      </Column>
    </YStack>
  ),
};

export const Centered: Story = {
  render: (args) => (
    <YStack maxWidth={360}>
      <Column {...args} align="center">
        <Text variant="hint">Nothing here yet.</Text>
        <Button size="sm">Add the first one</Button>
      </Column>
    </YStack>
  ),
};

export const SpaceAfter: Story = {
  render: (args) => (
    <YStack maxWidth={360}>
      <Column {...args} spaceAfter="lg">
        <Text variant="title">Weeknight favorites</Text>
      </Column>
      <Text>The next block sits one lg step (16px) below the title block.</Text>
    </YStack>
  ),
};
