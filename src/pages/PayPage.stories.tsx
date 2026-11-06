import { eciperayFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { PayPage } from "./PayPage.js";

const meta: Meta<typeof PayPage> = {
  title: "Pages/Eciperay/PayPage",
  component: PayPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof PayPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Opening: Story = {
  render: () => (
    <Viewport>
      <PayPage footer={eciperayFooterFixture} status="opening" />
    </Viewport>
  ),
};

export const Closed: Story = {
  render: () => (
    <Viewport>
      <PayPage footer={eciperayFooterFixture} status="closed" onRetryPress={() => undefined} />
    </Viewport>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <Viewport>
      <PayPage footer={eciperayFooterFixture} status="error" onRetryPress={() => undefined} />
    </Viewport>
  ),
};

export const NeedsTransaction: Story = {
  render: () => (
    <Viewport>
      <PayPage
        footer={eciperayFooterFixture}
        status="needs-transaction"
        onHomePress={() => undefined}
        homeLabel="Go to Eciperay home"
      />
    </Viewport>
  ),
};

export const Unconfigured: Story = {
  render: () => (
    <Viewport>
      <PayPage footer={eciperayFooterFixture} status="unconfigured" />
    </Viewport>
  ),
};
