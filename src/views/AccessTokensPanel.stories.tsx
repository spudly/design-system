import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { AccessTokensPanel } from "./AccessTokensPanel.js";
import { accessTokensFixture } from "../pages/fixtures.js";

const meta: Meta<typeof AccessTokensPanel> = {
  title: "Views/AccessTokensPanel",
  component: AccessTokensPanel,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AccessTokensPanel>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const WithTokens: Story = {
  render: () => (
    <Viewport>
      <AccessTokensPanel
        tokens={accessTokensFixture.tokens}
        tokenName="Kitchen tablet"
        onTokenNameChange={() => undefined}
        onCreate={() => undefined}
        createdSecret={null}
        onDismissSecret={() => undefined}
        onRevoke={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <AccessTokensPanel
        tokens={accessTokensFixture.tokens}
        loading
        tokenName=""
        onTokenNameChange={() => undefined}
        onCreate={() => undefined}
        createdSecret={null}
        onDismissSecret={() => undefined}
        onRevoke={() => undefined}
      />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
      <YStack position="relative">
        <AccessTokensPanel
          tokens={accessTokensFixture.tokens}
          tokenName="Kitchen tablet"
          onTokenNameChange={() => undefined}
          onCreate={() => undefined}
          createdSecret={null}
          onDismissSecret={() => undefined}
          onRevoke={() => undefined}
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
          <AccessTokensPanel
            tokens={accessTokensFixture.tokens}
            loading
            tokenName="Kitchen tablet"
            onTokenNameChange={() => undefined}
            onCreate={() => undefined}
            createdSecret={null}
            onDismissSecret={() => undefined}
            onRevoke={() => undefined}
          />
        </YStack>
      </YStack>
    </Viewport>
  ),
};

export const SecretJustCreated: Story = {
  render: () => (
    <Viewport>
      <AccessTokensPanel
        tokens={accessTokensFixture.tokens}
        tokenName=""
        onTokenNameChange={() => undefined}
        onCreate={() => undefined}
        createdSecret={accessTokensFixture.createdSecret}
        onDismissSecret={() => undefined}
        onRevoke={() => undefined}
      />
    </Viewport>
  ),
};

export const PlanNotice: Story = {
  render: () => (
    <Viewport>
      <AccessTokensPanel
        tokens={accessTokensFixture.tokens.slice(0, 1)}
        tokenName=""
        onTokenNameChange={() => undefined}
        onCreate={() => undefined}
        createdSecret={null}
        onDismissSecret={() => undefined}
        onRevoke={() => undefined}
        planNotice="API access tokens are a Power plan feature. Upgrade to create tokens."
      />
    </Viewport>
  ),
};
