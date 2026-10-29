import type { Meta, StoryObj } from "@storybook/react";
import { SessionHeader } from "./SessionHeader.js";

const meta: Meta<typeof SessionHeader> = {
  title: "Components/SessionHeader",
  component: SessionHeader,
};

export default meta;
type Story = StoryObj<typeof SessionHeader>;

export const Default: Story = {
  args: {
    title: "Plan a recipe with AI",
    subtitle: "Tell the assistant what you are craving.",
  },
};

export const PhaseLabel: Story = {
  args: {
    title: "Plan a recipe with AI",
    subtitle: "Planning",
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Plan a recipe with AI",
  },
};
