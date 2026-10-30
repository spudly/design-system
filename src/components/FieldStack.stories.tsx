import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { ButtonRow } from "./ButtonRow.js";
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
        <TextField label="Tag name" placeholder="e.g. Weeknight" />
        <TextField label="Note" placeholder="Optional note" />
        <ButtonRow>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </ButtonRow>
      </FieldStack>
    </YStack>
  ),
};
