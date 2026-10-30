import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SectionHeading } from "./SectionHeading.js";
import { Text } from "./Text.js";

const meta: Meta<typeof SectionHeading> = {
  title: "Components/SectionHeading",
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
