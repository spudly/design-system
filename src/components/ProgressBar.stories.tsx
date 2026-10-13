import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar.js";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Partial: Story = {
  args: { value: 70 },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const JustStarted: Story = {
  args: { value: 5 },
};
