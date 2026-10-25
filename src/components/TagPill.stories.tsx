import type { Meta, StoryObj } from "@storybook/react";
import { TagPill } from "./TagPill.js";

const meta: Meta<typeof TagPill> = {
  title: "Components/TagPill",
  component: TagPill,
  argTypes: {
    name: { control: "text" },
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof TagPill>;

export const Default: Story = {
  args: { name: "Weeknight", color: "#6366f1" },
};

export const Warm: Story = {
  args: { name: "Comfort food", color: "#d97706" },
};
