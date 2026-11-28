import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { LoadingScope } from "../../contexts/LoadingScope.js";
import { Col } from "../layout/Col.js";

import { LoadingListItem } from "./LoadingListItem.js";

const meta: Meta<typeof LoadingListItem> = {
  title: "Widgets/Feedback & Loading/LoadingListItem",
  component: LoadingListItem,
};

export default meta;
type Story = StoryObj<typeof LoadingListItem>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <Col>
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
        </Col>
      </LoadingScope>
    </YStack>
  ),
};
