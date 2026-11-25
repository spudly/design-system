import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { LoadingCardRow } from "./LoadingCardRow.js";
import { Col } from "../layout/Col.js";

const meta: Meta<typeof LoadingCardRow> = {
  title: "Widgets/Feedback & Loading/LoadingCardRow",
  component: LoadingCardRow,
};

export default meta;
type Story = StoryObj<typeof LoadingCardRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <Col>
          <LoadingCardRow />
          <LoadingCardRow />
          <LoadingCardRow />
        </Col>
      </LoadingScope>
    </YStack>
  ),
};
