import type { Meta, StoryObj } from "@storybook/react";
import { Hero } from "./Hero.js";

const meta: Meta<typeof Hero> = {
  title: "Components/Hero",
  component: Hero,
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {
    title: "Every recipe, one home",
    subtitle: "Save, plan, and cook from the recipes you love — on any device.",
  },
};
