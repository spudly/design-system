import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { tokens } from "../../tokens/index.js";
import { Text } from "../data/Text.js";

import { CenteredText } from "./CenteredText.js";

const meta: Meta<typeof CenteredText> = {
  title: "Widgets/Content/CenteredText",
  component: CenteredText,
};

export default meta;
type Story = StoryObj<typeof CenteredText>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} gap={tokens.spacing[4]}>
      <Text variant="heading">Cook something good</Text>
      <CenteredText muted>Your recipes, plans, and lists in one place.</CenteredText>
      <CenteredText>No recipes yet — add your first one to get started.</CenteredText>
    </YStack>
  ),
};
