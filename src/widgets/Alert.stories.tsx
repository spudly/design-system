import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Alert } from "./Alert.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Alert> = {
  title: "Widgets/Alert",
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

/**
 * Dismissal is host state (Alert never hides itself), so the
 * dismissible stories count activations instead of unmounting:
 * the line under the alert makes the callback observable in a
 * manual pass, the same pattern as StepOverlay's Done counter.
 */
function DismissDemo({
  message,
  severity = "info",
  dismissible = true,
}: {
  message: string;
  severity?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
}) {
  const [dismissals, setDismissals] = useState(0);
  return (
    <YStack gap="$2">
      <Alert
        message={message}
        severity={severity}
        dismissible={dismissible}
        onDismiss={() => setDismissals((n) => n + 1)}
      />
      {dismissals > 0 ? (
        <Text variant="hint">
          Dismiss activated ({dismissals}) — the host would hide the alert here.
        </Text>
      ) : null}
    </YStack>
  );
}

export const Dismissible: Story = {
  args: {
    message: "A new version of Eciperay is available for download.",
    severity: "info",
    dismissible: true,
  },
  render: ({ message, severity, dismissible }) => (
    <DismissDemo
      message={message ?? ""}
      severity={severity ?? "info"}
      dismissible={dismissible ?? true}
    />
  ),
};

export const DismissibleWarning: Story = {
  args: {
    message: "You're offline. Changes will sync when you reconnect.",
    severity: "warning",
    dismissible: true,
  },
  render: ({ message, severity, dismissible }) => (
    <DismissDemo
      message={message ?? ""}
      severity={severity ?? "warning"}
      dismissible={dismissible ?? true}
    />
  ),
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
