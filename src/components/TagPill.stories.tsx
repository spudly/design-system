import type { Meta, StoryObj } from "@storybook/react";
import { tagColorNameForHex, tagColorNames } from "../themes/tagColors.js";
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

/**
 * A legacy stored hex reaches the pill only as a name: the stored
 * value converts at the data boundary through `tagColorNameForHex`
 * (the typed `color` prop rejects a raw hex at compile time).
 */
export const LegacyHex: Story = {
  args: { name: "Freezer-friendly", color: tagColorNameForHex("#3b82f6") },
};
