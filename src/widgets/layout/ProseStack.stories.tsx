import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ProseStack } from "./ProseStack.js";
import { Text } from "../data/Text.js";

const meta: Meta<typeof ProseStack> = {
  title: "Widgets/Layout & Structure/ProseStack",
  component: ProseStack,
};

export default meta;
type Story = StoryObj<typeof ProseStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={640}>
      <ProseStack>
        <Text variant="subheading">What we collect</Text>
        <Text>The account details you give us when you sign up.</Text>
        <Text>The recipes you save to your account.</Text>
      </ProseStack>
    </YStack>
  ),
};
