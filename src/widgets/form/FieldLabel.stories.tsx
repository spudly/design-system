import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { Text } from "../data/Text.js";

import { FieldLabel } from "./FieldLabel.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FieldLabel> = {
  title: "Widgets/Form/FieldLabel",
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

export const Associated: Story = {
  render: () => (
    <YStack padding="$4" gap="$4" maxWidth={430}>
      <YStack gap="$1">
        <FieldLabel htmlFor="field-label-title">Title</FieldLabel>
        <TextField
          id="field-label-title"
          accessibilityLabel="Title"
          value="Tuscan chicken"
          onChangeText={() => { /* noop */ }}
        />
        <Text variant="hint">
          With `htmlFor` the web rendering is a real label element naming the field; clicking it
          focuses the field.
        </Text>
      </YStack>
    </YStack>
  ),
};
