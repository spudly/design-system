import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./data/Text.js";
import { StartStack } from "./StartStack.js";

const meta: Meta<typeof StartStack> = {
  title: "Widgets/StartStack",
  component: StartStack,
};

export default meta;
type Story = StoryObj<typeof StartStack>;

export const Default: Story = {
  render: () => (
    <StartStack>
      <Text>First action</Text>
      <Text>Second action</Text>
    </StartStack>
  ),
};
