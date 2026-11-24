import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../data/Text.js";
import { TightStack } from "./TightStack.js";

const meta: Meta<typeof TightStack> = {
  title: "Widgets/Layout & Structure/TightStack",
  component: TightStack,
};

export default meta;
type Story = StoryObj<typeof TightStack>;

export const Default: Story = {
  render: () => (
    <TightStack>
      <Text>First block</Text>
      <Text>Second block</Text>
    </TightStack>
  ),
};
