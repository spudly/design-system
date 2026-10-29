import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LabeledField } from "./LabeledField.js";
import { RevertAction } from "./RevertAction.js";
import { TextAreaField } from "./TextAreaField.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof LabeledField> = {
  title: "Components/LabeledField",
  component: LabeledField,
};

export default meta;
type Story = StoryObj<typeof LabeledField>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LabeledField label="Title">
        <TextField accessibilityLabel="Title" value="Tuscan chicken" onChangeText={() => {}} />
      </LabeledField>
    </YStack>
  ),
};

export const WithAction: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LabeledField
        label="Title"
        action={<RevertAction label="Chicken, plain" onPress={() => {}} />}
      >
        <TextField
          accessibilityLabel="Title"
          changed
          value="Tuscan chicken"
          onChangeText={() => {}}
        />
      </LabeledField>
    </YStack>
  ),
};

export const WithError: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LabeledField label="Description" error="Description could not be generated. Try again.">
        <TextAreaField
          accessibilityLabel="Description"
          numberOfLines={3}
          value=""
          onChangeText={() => {}}
        />
      </LabeledField>
    </YStack>
  ),
};
