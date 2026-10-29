import type { Meta, StoryObj } from "@storybook/react";
import { BackLink } from "./BackLink.js";

const meta: Meta<typeof BackLink> = {
  title: "Components/BackLink",
  component: BackLink,
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof BackLink>;

export const Default: Story = {
  args: {
    label: "Back",
    onPress: () => undefined,
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Back to recipes",
    onPress: () => undefined,
  },
};

export const Href: Story = {
  args: {
    label: "Back to recipes",
    href: "/recipes",
  },
};
