import { eciperayFooterFixture } from "./fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { PayPage } from "./PayPage.js";

const meta: Meta<typeof PayPage> = {
  title: "Pages/Eciperay/PayPage",
  component: PayPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof PayPage>;

export const Opening: Story = {
  render: () => (
    <>
      <PayPage footer={eciperayFooterFixture} status="opening" />
    </>
  ),
};

export const Closed: Story = {
  render: () => (
    <>
      <PayPage footer={eciperayFooterFixture} status="closed" onRetryPress={() => undefined} />
    </>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <>
      <PayPage footer={eciperayFooterFixture} status="error" onRetryPress={() => undefined} />
    </>
  ),
};

export const NeedsTransaction: Story = {
  render: () => (
    <>
      <PayPage
        footer={eciperayFooterFixture}
        status="needs-transaction"
        homeHref="/"
        homeLabel="Go to Eciperay home"
      />
    </>
  ),
};

export const Unconfigured: Story = {
  render: () => (
    <>
      <PayPage footer={eciperayFooterFixture} status="unconfigured" />
    </>
  ),
};
