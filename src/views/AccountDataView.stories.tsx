import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { AccountDataView } from "./AccountDataView.js";

const meta: Meta<typeof AccountDataView> = {
  title: "Views/AccountDataView",
  component: AccountDataView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AccountDataView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <AccountDataView onExportData={() => undefined} onDeleteAccount={() => undefined} />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <AccountDataView
        onExportData={() => undefined}
        onDeleteAccount={() => undefined}
        error="We couldn't prepare your download. Try again."
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <AccountDataView onExportData={() => undefined} onDeleteAccount={() => undefined} loading />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};
