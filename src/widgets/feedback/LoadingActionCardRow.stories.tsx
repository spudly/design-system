import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { LoadingScope } from "../../contexts/LoadingScope.js";
import { Col } from "../layout/Col.js";

import { LoadingActionCardRow } from "./LoadingActionCardRow.js";

const meta: Meta<typeof LoadingActionCardRow> = {
  title: "Widgets/Feedback & Loading/LoadingActionCardRow",
  component: LoadingActionCardRow,
};

export default meta;
type Story = StoryObj<typeof LoadingActionCardRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LoadingScope active>
        <Col gap="s">
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
        </Col>
      </LoadingScope>
    </YStack>
  ),
};
