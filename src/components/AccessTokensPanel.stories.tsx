import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { AccessTokensPanel } from "./AccessTokensPanel.js";
import { accessTokensFixture } from "../pages/fixtures.js";

const meta: Meta<typeof AccessTokensPanel> = {
  title: "Components/AccessTokensPanel",
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
