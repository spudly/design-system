import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FieldLabel } from "./FieldLabel.js";
import { Text } from "./Text.js";

const meta: Meta<typeof FieldLabel> = {
  title: "Components/FieldLabel",
  component: FieldLabel,
};

export default meta;
type Story = StoryObj<typeof FieldLabel>;

export const Default: Story = {
  render: () => (
    <YStack padding="$4" gap="$4" maxWidth={430}>
      <YStack gap="$1">
        <FieldLabel>Title</FieldLabel>
        <Text variant="hint">The label treatment every form field and labeled group shares.</Text>
      </YStack>
    </YStack>
  ),
};
