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
