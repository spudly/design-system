import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { CardStack } from "./CardStack.js";
import { LoadingActionCardRow } from "./LoadingActionCardRow.js";

const meta: Meta<typeof LoadingActionCardRow> = {
  title: "Widgets/LoadingActionCardRow",
  component: LoadingActionCardRow,
};

export default meta;
type Story = StoryObj<typeof LoadingActionCardRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <CardStack>
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
        </CardStack>
      </LoadingScope>
    </YStack>
  ),
};
