import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { ListStack } from "./ListStack.js";
import { LoadingCardRow } from "./LoadingCardRow.js";

const meta: Meta<typeof LoadingCardRow> = {
  title: "Widgets/LoadingCardRow",
  component: LoadingCardRow,
};

export default meta;
type Story = StoryObj<typeof LoadingCardRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <ListStack>
          <LoadingCardRow />
          <LoadingCardRow />
          <LoadingCardRow />
        </ListStack>
      </LoadingScope>
    </YStack>
  ),
};
