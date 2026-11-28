import type { Meta, StoryObj } from "@storybook/react";

import { FixedActionBanner } from "./FixedActionBanner.js";

const meta: Meta<typeof FixedActionBanner> = {
  title: "Widgets/Feedback & Loading/FixedActionBanner",
  component: FixedActionBanner,
};

export default meta;
type Story = StoryObj<typeof FixedActionBanner>;

export const Default: Story = {
  args: {
    message: "We use cookies to improve your experience.",
    primaryAction: { label: "Accept", onPress: () => { /* noop */ } },
    secondaryAction: { label: "Decline", onPress: () => { /* noop */ } },
    onDismiss: () => { /* noop */ },
  },
};

export const NoDismiss: Story = {
  args: {
    message: "A new version is available.",
    primaryAction: { label: "Update", onPress: () => { /* noop */ } },
  },
};
