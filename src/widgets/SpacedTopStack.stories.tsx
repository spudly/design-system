import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text.js";
import { SpacedTopStack } from "./SpacedTopStack.js";

const meta: Meta<typeof SpacedTopStack> = {
  title: "Widgets/SpacedTopStack",
  component: SpacedTopStack,
};

export default meta;
type Story = StoryObj<typeof SpacedTopStack>;

export const Default: Story = {
  render: () => (
    <SpacedTopStack>
      <Text>First block</Text>
    </SpacedTopStack>
  ),
};
