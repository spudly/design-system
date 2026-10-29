import type { Meta, StoryObj } from "@storybook/react";
import { ListLoadingFooter } from "./ListLoadingFooter.js";

const meta: Meta<typeof ListLoadingFooter> = {
  title: "Components/ListLoadingFooter",
  component: ListLoadingFooter,
};

export default meta;
type Story = StoryObj<typeof ListLoadingFooter>;

export const Default: Story = {
  args: {
    label: "Loading",
  },
};
