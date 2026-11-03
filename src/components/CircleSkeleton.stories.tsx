import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { CircleSkeleton } from "./CircleSkeleton.js";

const meta: Meta<typeof CircleSkeleton> = {
  title: "Components/CircleSkeleton",
  component: CircleSkeleton,
  argTypes: {
    size: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof CircleSkeleton>;

export const Default: Story = {
  args: { size: 40 },
};

export const Sizes: Story = {
  render: () => (
    <XStack gap={12} alignItems="center">
      <CircleSkeleton size={24} />
      <CircleSkeleton size={40} />
      <CircleSkeleton size={64} />
    </XStack>
  ),
};
