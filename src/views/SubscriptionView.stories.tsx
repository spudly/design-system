import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { SubscriptionView } from "./SubscriptionView.js";

const meta: Meta<typeof SubscriptionView> = {
  title: "Views/SubscriptionView",
  component: SubscriptionView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof SubscriptionView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

export const Active: Story = {
  render: () => (
    <Viewport>
      <SubscriptionView
        planLabel="Plus plan"
        statusText="Your Plus plan is active and renews on Dec 1, 2026."
        onManage={() => undefined}
        onRefresh={() => undefined}
        portalUrl="https://example.com/portal"
      />
    </Viewport>
  ),
};

export const FreeUpsell: Story = {
  render: () => (
    <Viewport>
      <SubscriptionView
        upsellText="You're on the free plan. Upgrade to Plus for meal planning and nutrition goals."
        onManage={() => undefined}
        manageLabel="See Plus"
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <SubscriptionView loading />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
      <YStack position="relative">
        <SubscriptionView
          planLabel="Plus plan"
          statusText="Your Plus plan is active and renews on Dec 1, 2026."
          onManage={() => undefined}
          onRefresh={() => undefined}
          portalUrl="https://example.com/portal"
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
          <SubscriptionView
            planLabel="Plus plan"
            statusText="Your Plus plan is active and renews on Dec 1, 2026."
            onManage={() => undefined}
            onRefresh={() => undefined}
            portalUrl="https://example.com/portal"
            loading
          />
        </YStack>
      </YStack>
    </Viewport>
  ),
};
