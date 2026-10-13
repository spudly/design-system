import type { Meta, StoryObj } from "@storybook/react";
import { SecretRevealPanel } from "./SecretRevealPanel.js";

const meta: Meta<typeof SecretRevealPanel> = {
  title: "Components/SecretRevealPanel",
  component: SecretRevealPanel,
  argTypes: {
    secret: { control: "text" },
    title: { control: "text" },
    copyLabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SecretRevealPanel>;

export const Default: Story = {
  args: {
    secret: "ecp_9f2b7d4a1c8e5f6a3b9d2e7f1a4c8b",
    onCopy: (s) => console.log("copied", s),
    onDismiss: () => console.log("dismissed"),
  },
};

export const WithoutDismiss: Story = {
  args: {
    secret: "ecp_9f2b7d4a1c8e5f6a3b9d2e7f1a4c8b",
    title: "Personal access token",
    onCopy: (s) => console.log("copied", s),
  },
};
