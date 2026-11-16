import { eciperayFooterFixture } from "./fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { RouteErrorPage } from "./RouteErrorPage.js";

const meta: Meta<typeof RouteErrorPage> = {
  title: "Pages/Eciperay/RouteErrorPage",
  component: RouteErrorPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RouteErrorPage>;

export const NotFound: Story = {
  render: () => (
    <>
      <RouteErrorPage footer={eciperayFooterFixture} variant="notFound" />
    </>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <>
      <RouteErrorPage footer={eciperayFooterFixture} variant="error" />
    </>
  ),
};
