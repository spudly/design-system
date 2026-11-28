import type { Meta, StoryObj } from "@storybook/react";

import { addRecipeMenuFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import { AddRecipeMenuPage } from "./AddRecipeMenuPage.js";

const meta: Meta<typeof AddRecipeMenuPage> = {
  title: "Pages/Eciperay/AddRecipeMenuPage",
  component: AddRecipeMenuPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AddRecipeMenuPage>;

export const Menu: Story = {
  render: () => (
    <>
      <AddRecipeMenuPage footer={eciperayFooterFixture} options={addRecipeMenuFixture.options} />
    </>
  ),
};
