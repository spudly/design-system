import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CardRow } from "./CardRow.js";
import { CardStack } from "./CardStack.js";

const meta: Meta<typeof CardStack> = {
  title: "Components/CardStack",
  component: CardStack,
};

export default meta;
type Story = StoryObj<typeof CardStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <CardStack>
        <CardRow
          title="Weeknight favorites"
          subtitle="4 entries"
          onPress={() => {}}
          actionLabel="Delete"
          actionTone="danger"
          onActionPress={() => {}}
        />
        <CardRow title="Sunday prep" subtitle="2 entries" onPress={() => {}} />
        <CardRow title="Holiday baking" onPress={() => {}} />
      </CardStack>
    </YStack>
  ),
};
