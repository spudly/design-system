import type { Meta, StoryObj } from "@storybook/react";
import { BoxSkeleton } from "./BoxSkeleton.js";

const meta: Meta<typeof BoxSkeleton> = {
  title: "Components/BoxSkeleton",
  component: BoxSkeleton,
  argTypes: {
    width: { control: "number" },
    height: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof BoxSkeleton>;

export const Default: Story = {
  args: { width: 280, height: 160 },
};

export const CardWidth: Story = {
  args: { width: "100%", height: 120 },
};
