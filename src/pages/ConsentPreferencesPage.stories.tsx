import { eciperayFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ConsentPreferencesPage } from "./ConsentPreferencesPage.js";

const meta: Meta<typeof ConsentPreferencesPage> = {
  title: "Pages/Eciperay/ConsentPreferencesPage",
  component: ConsentPreferencesPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConsentPreferencesPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const actions = {
  onAccept: () => undefined,
  onDecline: () => undefined,
  onWithdraw: () => undefined,
};

export const Accepted: Story = {
  render: () => (
    <Viewport>
      <ConsentPreferencesPage
        footer={eciperayFooterFixture}
        currentChoice="accepted"
        {...actions}
      />
    </Viewport>
  ),
};

export const NotSet: Story = {
  render: () => (
    <Viewport>
      <ConsentPreferencesPage footer={eciperayFooterFixture} currentChoice={null} {...actions} />
    </Viewport>
  ),
};
