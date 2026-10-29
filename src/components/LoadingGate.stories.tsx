import type { Meta, StoryObj } from "@storybook/react";
import { LoadingGate } from "./LoadingGate.js";

const meta: Meta<typeof LoadingGate> = {
  title: "Components/LoadingGate",
  component: LoadingGate,
};

export default meta;
type Story = StoryObj<typeof LoadingGate>;

export const Default: Story = {
  args: { label: "Loading meal plan" },
};
