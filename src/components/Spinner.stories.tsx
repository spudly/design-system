import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner.js";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "large"],
    },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Large: Story = {
  args: { size: "large", label: "Loading recipes" },
};
