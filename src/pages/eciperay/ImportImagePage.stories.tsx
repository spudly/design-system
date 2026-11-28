import type { Meta, StoryObj } from "@storybook/react";

import { eciperayFooterFixture } from "../shared/fixtures.js";

import { ImportImagePage } from "./ImportImagePage.js";

const meta: Meta<typeof ImportImagePage> = {
  title: "Pages/Eciperay/ImportImagePage",
  component: ImportImagePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportImagePage>;

export const Idle: Story = {
  render: () => (
    <>
      <ImportImagePage
        footer={eciperayFooterFixture}
        onPickCamera={() => {}}
        onPickLibrary={() => {}}
      />
    </>
  ),
};
