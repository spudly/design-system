import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { ChoiceRow } from "./ChoiceRow.js";

const meta: Meta<typeof ChoiceRow> = {
  title: "Components/ChoiceRow",
  component: ChoiceRow,
};

export default meta;
type Story = StoryObj<typeof ChoiceRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChoiceRow>
        <Button variant="secondary" size="sm" accessibilityLabel="Add Status filter">
          Status
        </Button>
        <Button variant="secondary" size="sm" accessibilityLabel="Add Ingredient filter">
          Ingredient
        </Button>
        <Button variant="secondary" size="sm" accessibilityLabel="Add Calories filter">
          Calories
        </Button>
        <Button variant="secondary" size="sm" accessibilityLabel="Add Satiety filter">
          Satiety
        </Button>
        <Button variant="secondary" size="sm" accessibilityLabel="Add Sort filter">
          Sort
        </Button>
      </ChoiceRow>
    </YStack>
  ),
};
