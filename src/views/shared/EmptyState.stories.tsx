import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState.js";

const meta: Meta<typeof EmptyState> = {
  title: "Views/Shared/EmptyState",
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
export const WithIconAndHrefAction: Story = {
  args: {
    title: "No verses yet",
    body: "Find one in the Search tab to get started.",
    icon: "recipes",
    actionLabel: "Search verses",
    actionHref: "/search",
  },
};

export const WithIconAndCallbackAction: Story = {
  args: {
    title: "No results",
    body: "Try a different word or reference.",
    icon: "help",
    actionLabel: "Clear search",
    onAction: () => undefined,
  },
};
