import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ProseColumn } from "./ProseColumn.js";
import { ProseStack } from "./ProseStack.js";
import { Text } from "../data/Text.js";

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
        <ProseStack>
          <Text variant="heading">Privacy Policy</Text>
          <Text variant="hint">Last updated July 22, 2026</Text>
        </ProseStack>
        <ProseStack>
          <Text variant="subheading">What we collect</Text>
          <Text>The account details you give us when you sign up.</Text>
        </ProseStack>
      </ProseColumn>
    </YStack>
  ),
};
