import type { Meta, StoryObj } from "@storybook/react";
import { ListLoadingState } from "./ListLoadingState.js";

const meta: Meta<typeof ListLoadingState> = {
  title: "Components/ListLoadingState",
  component: ListLoadingState,
};

export default meta;
type Story = StoryObj<typeof ListLoadingState>;

export const Default: Story = {
  args: {
    label: "Loading",
  },
};
