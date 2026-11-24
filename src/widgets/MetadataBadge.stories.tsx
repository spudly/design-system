import type { Meta, StoryObj } from "@storybook/react";
import { MetadataBadge } from "./MetadataBadge.js";

const meta: Meta<typeof MetadataBadge> = {
  title: "Widgets/MetadataBadge",
  component: MetadataBadge,
};

export default meta;
type Story = StoryObj<typeof MetadataBadge>;

export const Full: Story = {
  args: { parts: ["Weeknight", "45 min", "Serves 4"] },
};

export const Partial: Story = {
  args: { parts: [undefined, "45 min", "Serves 4"] },
};

export const Single: Story = {
  args: { parts: ["Serves 4"] },
};

export const Empty: Story = {
  args: { parts: [undefined, ""] },
};
