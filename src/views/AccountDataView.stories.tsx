import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { AccountDataView } from "./AccountDataView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof AccountDataView> = {
  title: "Views/AccountDataView",
  component: AccountDataView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AccountDataView>;

export const Default: Story = {
  render: () => (
    <StoryFrame padded>
      <AccountDataView onExportData={() => undefined} onDeleteAccount={() => undefined} />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame padded>
      <AccountDataView
        onExportData={() => undefined}
        onDeleteAccount={() => undefined}
        error="We couldn't prepare your download. Try again."
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame padded>
      <AccountDataView onExportData={() => undefined} onDeleteAccount={() => undefined} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame padded>
      <View position="relative">
        <AccountDataView onExportData={() => undefined} onDeleteAccount={() => undefined} />
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <AccountDataView
            onExportData={() => undefined}
            onDeleteAccount={() => undefined}
            loading
          />
        </View>
      </View>
    </StoryFrame>
  ),
};
