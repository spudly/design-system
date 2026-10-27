import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert.js";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  argTypes: {
    severity: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    message: { control: "text" },
    dismissible: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    severity: "info",
    children: "Syncing your verses with Google Drive…",
  },
};

export const Success: Story = {
  args: { severity: "success", children: "Verse memorized! Nice work." },
};

export const Warning: Story = {
  args: {
    severity: "warning",
    children: "You have 3 verses due for review today.",
  },
};

export const Error: Story = {
  args: {
    severity: "error",
    children: "Could not load recipes. Check your connection and try again.",
  },
};

export const Dismissible: Story = {
  args: {
    message: "A new version of Eciperay is available for download.",
    dismissible: true,
    onDismiss: () => {},
  },
};

export const DismissibleWarning: Story = {
  args: {
    message: "You're offline. Changes will sync when you reconnect.",
    severity: "warning",
    dismissible: true,
    onDismiss: () => {},
  },
};

export const WithActions: Story = {
  args: {
    message: "Install the mobile app for a faster cooking-mode experience.",
    dismissible: true,
    onDismiss: () => {},
    actions: [
      { label: "Install", onPress: () => {} },
      { label: "Learn more", onPress: () => {} },
    ],
  },
};
