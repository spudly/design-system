import { eciperayFooterFixture } from "./fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { ImportTextPage } from "./ImportTextPage.js";

const meta: Meta<typeof ImportTextPage> = {
  title: "Pages/Eciperay/ImportTextPage",
  component: ImportTextPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportTextPage>;

export const Empty: Story = {
  render: () => (
    <>
      <ImportTextPage footer={eciperayFooterFixture} onSubmit={() => undefined} />
    </>
  ),
};

export const WithError: Story = {
  render: () => (
    <>
      <ImportTextPage
        footer={eciperayFooterFixture}
        error="We couldn't find a recipe in that text. Check it and try again."
        onSubmit={() => undefined}
      />
    </>
  ),
};
