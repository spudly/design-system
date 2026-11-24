import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../data/Text.js";
import { CompactStack } from "./CompactStack.js";

const meta: Meta<typeof CompactStack> = {
  title: "Widgets/Layout & Structure/CompactStack",
  component: CompactStack,
};

export default meta;
type Story = StoryObj<typeof CompactStack>;

export const Default: Story = {
  render: () => (
    <CompactStack>
      <Text>First block</Text>
      <Text>Second block</Text>
    </CompactStack>
  ),
};
