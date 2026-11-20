import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text.js";
import { Grow } from "./Grow.js";

const meta: Meta<typeof Grow> = {
  title: "Widgets/Grow",
  component: Grow,
};

export default meta;
type Story = StoryObj<typeof Grow>;

export const Default: Story = {
  render: () => (
    <Grow>
      <Text>First block</Text>
      <Text>Second block</Text>
    </Grow>
  ),
};
