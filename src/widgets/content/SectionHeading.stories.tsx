import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SectionHeading } from "./SectionHeading.js";
import { Text } from "../Text.js";

const meta: Meta<typeof SectionHeading> = {
  title: "Widgets/Content/SectionHeading",
  component: SectionHeading,
};

export default meta;
type Story = StoryObj<typeof SectionHeading>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <SectionHeading>Ingredients</SectionHeading>
      <YStack padding="$4">
        <Text variant="hint">The heading stands over its section's panel.</Text>
      </YStack>
      <SectionHeading>Instructions</SectionHeading>
    </YStack>
  ),
};

export const WithIcon: Story = {
  // #721: the opt-in icon form — the named glyph in the primary
  // ink beside the heading text (RecipeDetailPage's Ingredients
  // heading).
  render: () => (
    <YStack maxWidth={430}>
      <SectionHeading icon="list">Ingredients</SectionHeading>
      <YStack padding="$4">
        <Text variant="hint">The heading carries the list glyph beside its text.</Text>
      </YStack>
      <SectionHeading>Instructions</SectionHeading>
    </YStack>
  ),
};
