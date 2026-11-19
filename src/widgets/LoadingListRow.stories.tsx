import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { ListStack } from "./ListStack.js";
import { LoadingListRow } from "./LoadingListRow.js";

const meta: Meta<typeof LoadingListRow> = {
  title: "Widgets/LoadingListRow",
  component: LoadingListRow,
};

export default meta;
type Story = StoryObj<typeof LoadingListRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <ListStack>
          <LoadingListRow />
          <LoadingListRow />
          <LoadingListRow />
        </ListStack>
      </LoadingScope>
    </YStack>
  ),
};
