import type { Meta, StoryObj } from "@storybook/react";
import { DismissibleBanner } from "./DismissibleBanner.js";

const meta: Meta<typeof DismissibleBanner> = {
  title: "Components/DismissibleBanner",
  component: DismissibleBanner,
  argTypes: {
    message: { control: "text" },
    tone: {
      control: "select",
      options: ["info", "warning"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DismissibleBanner>;

export const Info: Story = {
  args: {
    message: "A new version of Eciperay is available for download.",
    onDismiss: () => {},
  },
};

export const Warning: Story = {
  args: {
    message: "You're offline. Changes will sync when you reconnect.",
    tone: "warning",
    onDismiss: () => {},
  },
};

export const WithActions: Story = {
  args: {
    message: "Install the mobile app for a faster cooking-mode experience.",
    onDismiss: () => {},
    actions: [
      { label: "Install", onPress: () => {} },
      { label: "Learn more", onPress: () => {} },
    ],
  },
};
