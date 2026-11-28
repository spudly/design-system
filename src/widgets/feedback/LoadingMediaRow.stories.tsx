import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { LoadingScope } from "../../contexts/LoadingScope.js";
import { Col } from "../layout/Col.js";

import { LoadingMediaRow } from "./LoadingMediaRow.js";

const meta: Meta<typeof LoadingMediaRow> = {
  title: "Widgets/Feedback & Loading/LoadingMediaRow",
  component: LoadingMediaRow,
};

export default meta;
type Story = StoryObj<typeof LoadingMediaRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <Col>
          <LoadingMediaRow />
          <LoadingMediaRow />
          <LoadingMediaRow />
        </Col>
      </LoadingScope>
    </YStack>
  ),
};
