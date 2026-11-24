import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./data/Text.js";
import { SkeletonPanel } from "./SkeletonPanel.js";

const meta: Meta<typeof SkeletonPanel> = {
  title: "Widgets/SkeletonPanel",
  component: SkeletonPanel,
};

export default meta;
type Story = StoryObj<typeof SkeletonPanel>;

export const Default: Story = {
  render: () => (
    <SkeletonPanel>
      <Text>First bone</Text>
      <Text>Second bone</Text>
    </SkeletonPanel>
  ),
};
