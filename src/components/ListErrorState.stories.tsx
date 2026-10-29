import type { Meta, StoryObj } from "@storybook/react";
import { ListErrorState } from "./ListErrorState.js";

const meta: Meta<typeof ListErrorState> = {
  title: "Components/ListErrorState",
  component: ListErrorState,
};

export default meta;
type Story = StoryObj<typeof ListErrorState>;

export const Default: Story = {
  args: {
    message: "We couldn't load recipes. Check your connection and try again.",
  },
};
