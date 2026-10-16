import type { Meta, StoryObj } from "@storybook/react";
import { StepDots } from "./StepDots.js";

const meta: Meta<typeof StepDots> = {
  title: "Components/StepDots",
  component: StepDots,
  argTypes: {
    count: { control: { type: "number", min: 1, max: 10 } },
    activeIndex: { control: { type: "number", min: 0, max: 9 } },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StepDots>;

export const Middle: Story = {
  args: { count: 5, activeIndex: 2 },
};

export const First: Story = {
  args: { count: 5, activeIndex: 0, label: "Step 1 of 5" },
};

export const Last: Story = {
  args: { count: 5, activeIndex: 4 },
};

export const Streak: Story = {
  args: { count: 5, activeIndex: 2, label: "3-day study streak" },
};
