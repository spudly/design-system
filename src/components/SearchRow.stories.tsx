import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { SearchField } from "./SearchField.js";
import { SearchRow } from "./SearchRow.js";

const meta: Meta<typeof SearchRow> = {
  title: "Components/SearchRow",
  component: SearchRow,
};

export default meta;
type Story = StoryObj<typeof SearchRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <SearchRow>
        <SearchField grow value="" onChangeText={() => {}} placeholder="Search recipes…" />
        <Button variant="secondary" size="sm" accessibilityLabel="Add a filter">
          Filters
        </Button>
      </SearchRow>
    </YStack>
  ),
};
