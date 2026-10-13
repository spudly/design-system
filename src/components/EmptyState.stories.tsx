import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState.js";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    actionLabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No verses yet",
    body: "Find one in the Search tab to start memorizing.",
    actionLabel: "Search verses",
  },
};

export const WithoutAction: Story = {
  args: {
    title: "Nothing due",
    body: "Nice work — check back tomorrow.",
  },
};

export const TitleOnly: Story = {
  args: { title: "No items on this list" },
};
