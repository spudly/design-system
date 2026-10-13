import type { Meta, StoryObj } from "@storybook/react";
import { InlineAlert } from "./InlineAlert.js";

const meta: Meta<typeof InlineAlert> = {
  title: "Components/InlineAlert",
  component: InlineAlert,
  argTypes: {
    severity: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const Info: Story = {
  args: {
    severity: "info",
    children: "Syncing your verses with Google Drive…",
  },
};

export const Success: Story = {
  args: { severity: "success", children: "Verse memorized! Nice work." },
};

export const Warning: Story = {
  args: {
    severity: "warning",
    children: "You have 3 verses due for review today.",
  },
};

export const Error: Story = {
  args: {
    severity: "error",
    children: "Could not load recipes. Check your connection and try again.",
  },
};
