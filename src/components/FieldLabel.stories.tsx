import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { FieldLabel } from "./FieldLabel.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FieldLabel> = {
  title: "Components/FieldLabel",
  component: FieldLabel,
};

export default meta;
type Story = StoryObj<typeof FieldLabel>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} gap={4}>
      <FieldLabel>Title</FieldLabel>
      <TextField accessibilityLabel="Title" value="Tuscan chicken" onChangeText={() => {}} />
    </YStack>
  ),
};
