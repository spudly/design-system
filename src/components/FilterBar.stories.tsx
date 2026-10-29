import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { FilterBar } from "./FilterBar.js";
import { RemovableField } from "./RemovableField.js";
import { SearchField } from "./SearchField.js";
import { SearchRow } from "./SearchRow.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FilterBar> = {
  title: "Components/FilterBar",
  component: FilterBar,
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <FilterBar>
        <SearchRow>
          <SearchField grow value="" onChangeText={() => {}} placeholder="Search recipes…" />
          <Button variant="secondary" size="sm" accessibilityLabel="Add a filter">
            Filters
          </Button>
        </SearchRow>
        <RemovableField removeAccessibilityLabel="Remove Ingredient filter" onRemove={() => {}}>
          <TextField
            label="Ingredient"
            accessibilityLabel="Ingredient"
            value=""
            onChangeText={() => {}}
            placeholder="e.g. chicken"
          />
        </RemovableField>
      </FilterBar>
    </YStack>
  ),
};
