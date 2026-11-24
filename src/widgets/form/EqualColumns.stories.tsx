import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { EqualColumns } from "./EqualColumns.js";
import { LabeledField } from "./LabeledField.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof EqualColumns> = {
  title: "Widgets/Form/EqualColumns",
  component: EqualColumns,
};

export default meta;
type Story = StoryObj<typeof EqualColumns>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <EqualColumns>
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
      </EqualColumns>
    </YStack>
  ),
};
