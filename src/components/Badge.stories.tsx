import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge.js";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: { tone: "neutral", children: "Learning" },
};

export const Info: Story = {
  args: { tone: "info", children: "Syncing" },
};

export const Success: Story = {
  args: { tone: "success", children: "Memorized" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Due soon" },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Overdue" },
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
};
