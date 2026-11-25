import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ProseColumn } from "./ProseColumn.js";
import { Text } from "../data/Text.js";
import { Col } from "./Col.js";

const meta: Meta<typeof ProseColumn> = {
  title: "Widgets/Layout & Structure/ProseColumn",
  component: ProseColumn,
};

export default meta;
type Story = StoryObj<typeof ProseColumn>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={1024}>
      <ProseColumn>
        <Col gap="m">
          <Text variant="heading">Privacy Policy</Text>
          <Text variant="hint">Last updated July 22, 2026</Text>
        </Col>
        <Col gap="m">
          <Text variant="subheading">What we collect</Text>
          <Text>The account details you give us when you sign up.</Text>
        </Col>
      </ProseColumn>
    </YStack>
  ),
};
