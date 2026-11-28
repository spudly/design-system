import type { Meta, StoryObj } from "@storybook/react";

import { eciperayFooterFixture } from "../shared/fixtures.js";

import { ConsentPreferencesPage } from "./ConsentPreferencesPage.js";

const meta: Meta<typeof ConsentPreferencesPage> = {
  title: "Pages/Eciperay/ConsentPreferencesPage",
  component: ConsentPreferencesPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ConsentPreferencesPage>;

const actions = {
  onAccept: () => {},
  onDecline: () => {},
  onWithdraw: () => {},
};

export const Accepted: Story = {
  render: () => (
    <>
      <ConsentPreferencesPage
        footer={eciperayFooterFixture}
        currentChoice="accepted"
        {...actions}
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <ConsentPreferencesPage
        footer={eciperayFooterFixture}
        currentChoice={null}
        {...actions}
        loading
      />
    </>
  ),
};

export const NotSet: Story = {
  render: () => (
    <>
      <ConsentPreferencesPage footer={eciperayFooterFixture} currentChoice={null} {...actions} />
    </>
  ),
};
