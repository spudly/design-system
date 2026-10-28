import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { TextAction } from "./TextAction.js";

const meta: Meta<typeof TextAction> = {
  title: "Components/TextAction",
  component: TextAction,
};

export default meta;
type Story = StoryObj<typeof TextAction>;

export const Default: Story = {
  render: () => (
    <XStack gap="$3">
      <TextAction
        color="$primary"
        fontSize={tokens.typography.fontSize.xs}
        fontWeight={tokens.typography.fontWeight.medium}
        onPress={() => undefined}
      >
        Edit
      </TextAction>
      <TextAction
        fontSize={tokens.typography.fontSize.xs}
        color={tokens.colors.danger.danger7}
        onPress={() => undefined}
      >
        Delete
      </TextAction>
    </XStack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <TextAction
      disabled
      color="$primary"
      fontSize={tokens.typography.fontSize.xs}
      fontWeight={tokens.typography.fontWeight.medium}
      opacity={0.5}
      onPress={() => undefined}
    >
      Save
    </TextAction>
  ),
};
