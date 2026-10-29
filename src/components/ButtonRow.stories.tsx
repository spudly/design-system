import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { ButtonRow } from "./ButtonRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ButtonRow> = {
  title: "Components/ButtonRow",
  component: ButtonRow,
};

export default meta;
type Story = StoryObj<typeof ButtonRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={360}>
      <Text>
        Tender chicken, garlic cream sauce with spinach and sun-dried tomatoes — the button row
        below follows the content at the bar's standard separation.
      </Text>
      <ButtonRow>
        <Button>Shopping list</Button>
        <Button variant="secondary">Edit</Button>
      </ButtonRow>
    </YStack>
  ),
};
