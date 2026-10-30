import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { FormStack } from "./FormStack.js";
import { LabeledField } from "./LabeledField.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FormStack> = {
  title: "Components/FormStack",
  component: FormStack,
};

export default meta;
type Story = StoryObj<typeof FormStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <FormStack>
        <LabeledField label="Title">
          <TextField accessibilityLabel="Title" value="Tuscan chicken" onChangeText={() => {}} />
        </LabeledField>
        <LabeledField label="Source URL">
          <TextField
            accessibilityLabel="Source URL"
            value="https://example.com/tuscan-chicken"
            onChangeText={() => {}}
          />
        </LabeledField>
        <Button onPress={() => {}}>Save Changes</Button>
      </FormStack>
    </YStack>
  ),
};
