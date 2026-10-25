import type { Meta, StoryObj } from "@storybook/react";
import { FixedActionBanner } from "./FixedActionBanner.js";

const meta: Meta<typeof FixedActionBanner> = {
  title: "Components/FixedActionBanner",
  component: FixedActionBanner,
};

export default meta;
type Story = StoryObj<typeof FixedActionBanner>;

export const Default: Story = {
  args: {
    message: "We use cookies to improve your experience.",
    primaryAction: { label: "Accept", onPress: () => {} },
    secondaryAction: { label: "Decline", onPress: () => {} },
    onDismiss: () => {},
  },
};

export const NoDismiss: Story = {
  args: {
    message: "A new version is available.",
    primaryAction: { label: "Update", onPress: () => {} },
  },
};
