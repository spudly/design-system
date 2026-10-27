import type { Meta, StoryObj } from "@storybook/react";
import { tagColorNames } from "../themes/tagColors.js";
import { TagPill } from "./TagPill.js";

const meta: Meta<typeof TagPill> = {
  title: "Components/TagPill",
  component: TagPill,
  argTypes: {
    name: { control: "text" },
    color: { control: "select", options: [...tagColorNames] },
  },
};

export default meta;
type Story = StoryObj<typeof TagPill>;

export const Default: Story = {
  args: { name: "Weeknight", color: "indigo" },
};

export const Warm: Story = {
  args: { name: "Comfort food", color: "amber" },
};

/** A legacy stored hex still renders: it resolves through its token name's mapping. */
export const LegacyHex: Story = {
  args: { name: "Freezer-friendly", color: "#3b82f6" },
};
