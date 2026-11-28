import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../data/Text.js";

import { FramedScrollRegion } from "./FramedScrollRegion.js";

const meta: Meta<typeof FramedScrollRegion> = {
  title: "Widgets/Layout & Structure/FramedScrollRegion",
  component: FramedScrollRegion,
};

export default meta;
type Story = StoryObj<typeof FramedScrollRegion>;

export const Default: Story = {
  render: () => (
    <FramedScrollRegion>
      <Text>First item</Text>
      <Text>Second item</Text>
    </FramedScrollRegion>
  ),
};

export const Loading: Story = {
  render: () => (
    <FramedScrollRegion loading>
      <Text>First item</Text>
    </FramedScrollRegion>
  ),
};
