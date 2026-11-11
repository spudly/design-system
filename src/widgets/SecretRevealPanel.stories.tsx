import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SecretRevealPanel } from "./SecretRevealPanel.js";

const meta: Meta<typeof SecretRevealPanel> = {
  title: "Widgets/SecretRevealPanel",
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

export const Loading: Story = {
  args: {
    secret: "storybook-fixture-value",
    onCopy: (s) => console.log("copied", s),
    onDismiss: () => console.log("dismissed"),
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative">
      <SecretRevealPanel
        secret="storybook-fixture-value"
        onCopy={(s) => console.log("copied", s)}
        onDismiss={() => console.log("dismissed")}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <SecretRevealPanel
          secret="storybook-fixture-value"
          onCopy={(s) => console.log("copied", s)}
          onDismiss={() => console.log("dismissed")}
          loading
        />
      </YStack>
    </YStack>
  ),
};

export const WithoutDismiss: Story = {
  args: {
    secret: "ecp_9f2b7d4a1c8e5f6a3b9d2e7f1a4c8b",
    title: "Personal access token",
    onCopy: (s) => console.log("copied", s),
  },
};
