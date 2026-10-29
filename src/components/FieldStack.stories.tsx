import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FieldStack } from "./FieldStack.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FieldStack> = {
  title: "Components/FieldStack",
  component: FieldStack,
};

export default meta;
type Story = StoryObj<typeof FieldStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <FieldStack>
        <TextField label="Min cal" accessibilityLabel="Min cal" value="" onChangeText={() => {}} />
        <TextField label="Max cal" accessibilityLabel="Max cal" value="" onChangeText={() => {}} />
      </FieldStack>
    </YStack>
  ),
};
