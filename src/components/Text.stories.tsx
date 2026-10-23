import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Text } from "./Text.js";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  argTypes: {
    variant: {
      control: "select",
      options: ["heading", "subheading", "body", "hint", "error", "verse"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Heading: Story = {
  args: { variant: "heading", children: "Discover Recipes" },
};

export const Subheading: Story = {
  args: { variant: "subheading", children: "Verses in progress" },
};

export const Body: Story = {
  args: {
    variant: "body",
    children: "Tender chicken, garlic cream sauce with spinach & sun-dried tomatoes.",
  },
};

export const Hint: Story = {
  args: { variant: "hint", children: "Searching the built-in demo set…" },
};

export const Error: Story = {
  args: { variant: "error", children: "Something went wrong. Try again." },
};

export const Verse: Story = {
  args: {
    variant: "verse",
    children: "The LORD is my shepherd; I shall not want.",
  },
};

export const AllVariants: Story = {
  render: () => (
    <YStack gap={8}>
      <Text variant="heading">Heading</Text>
      <Text variant="subheading">Subheading</Text>
      <Text variant="body">Body text</Text>
      <Text variant="hint">Hint text</Text>
      <Text variant="error">Error text</Text>
      <Text variant="verse">Verse text</Text>
    </YStack>
  ),
};
