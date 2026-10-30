import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { RemovableField } from "./RemovableField.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof RemovableField> = {
  title: "Components/RemovableField",
  component: RemovableField,
};

export default meta;
type Story = StoryObj<typeof RemovableField>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <RemovableField removeAccessibilityLabel="Remove Ingredient filter" onRemove={() => {}}>
        <TextField
          label="Ingredient"
          accessibilityLabel="Ingredient"
          value="chicken"
          onChangeText={() => {}}
          placeholder="e.g. chicken"
        />
      </RemovableField>
    </YStack>
  ),
};
