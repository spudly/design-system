import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { ListStack } from "./ListStack.js";
import { LoadingMediaRow } from "./LoadingMediaRow.js";

const meta: Meta<typeof LoadingMediaRow> = {
  title: "Widgets/LoadingMediaRow",
  component: LoadingMediaRow,
};

export default meta;
type Story = StoryObj<typeof LoadingMediaRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <ListStack>
          <LoadingMediaRow />
          <LoadingMediaRow />
          <LoadingMediaRow />
        </ListStack>
      </LoadingScope>
    </YStack>
  ),
};
