import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FieldColumns } from "./FieldColumns.js";
import { LabeledField } from "./LabeledField.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FieldColumns> = {
  title: "Components/FieldColumns",
  component: FieldColumns,
};

export default meta;
type Story = StoryObj<typeof FieldColumns>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <FieldColumns>
        <LabeledField label="Servings">
          <TextField
            accessibilityLabel="Servings"
            keyboardType="number-pad"
            value="4"
            onChangeText={() => {}}
          />
        </LabeledField>
        <LabeledField label="Prep (min)">
          <TextField
            accessibilityLabel="Prep (min)"
            keyboardType="number-pad"
            value="15"
            onChangeText={() => {}}
          />
        </LabeledField>
        <LabeledField label="Cook (min)">
          <TextField
            accessibilityLabel="Cook (min)"
            keyboardType="number-pad"
            value="30"
            onChangeText={() => {}}
          />
        </LabeledField>
      </FieldColumns>
    </YStack>
  ),
};
