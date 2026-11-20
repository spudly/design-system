import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text.js";
import { ListHeaderStack } from "./ListHeaderStack.js";

const meta: Meta<typeof ListHeaderStack> = {
  title: "Widgets/ListHeaderStack",
  component: ListHeaderStack,
};

export default meta;
type Story = StoryObj<typeof ListHeaderStack>;

export const Default: Story = {
  render: () => (
    <ListHeaderStack>
      <Text>First block</Text>
      <Text>Second block</Text>
    </ListHeaderStack>
  ),
};
