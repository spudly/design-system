import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { FieldRow } from "./FieldRow.js";
import { SearchField } from "./SearchField.js";

const meta: Meta<typeof FieldRow> = {
  title: "Components/FieldRow",
  component: FieldRow,
};

export default meta;
type Story = StoryObj<typeof FieldRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <FieldRow>
        <SearchField grow value="" onChangeText={() => {}} placeholder="e.g. Ether 12:27" />
        <Button>Search</Button>
      </FieldRow>
    </YStack>
  ),
};
