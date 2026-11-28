import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";

import { StoryFrame } from "../shared/storyFrame.js";

import { AccountDataView } from "./AccountDataView.js";

const meta: Meta<typeof AccountDataView> = {
  title: "Views/Eciperay/AccountDataView",
  component: AccountDataView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AccountDataView>;

export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AccountDataView onExportData={() => { /* noop */ }} onDeleteAccount={() => { /* noop */ }} />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AccountDataView
        onExportData={() => { /* noop */ }}
        onDeleteAccount={() => { /* noop */ }}
        error="We couldn't prepare your download. Try again."
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AccountDataView onExportData={() => { /* noop */ }} onDeleteAccount={() => { /* noop */ }} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <View position="relative">
        <AccountDataView onExportData={() => { /* noop */ }} onDeleteAccount={() => { /* noop */ }} />
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
            onExportData={() => { /* noop */ }}
            onDeleteAccount={() => { /* noop */ }}
            loading
          />
        </View>
      </View>
    </StoryFrame>
  ),
};
