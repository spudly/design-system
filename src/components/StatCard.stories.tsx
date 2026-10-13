import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard.js";

const meta: Meta<typeof StatCard> = {
  title: "Components/StatCard",
  component: StatCard,
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    sublabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    value: "12",
    label: "verses mastered",
    sublabel: "Keep going — you're building consistency",
  },
};

export const WithoutSublabel: Story = {
  args: { value: "5", label: "day streak" },
};
