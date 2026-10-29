import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { addRecipeMenuFixture } from "./fixtures.js";
import { AddRecipeMenuPage } from "./AddRecipeMenuPage.js";

const meta: Meta<typeof AddRecipeMenuPage> = {
  title: "Pages/Eciperay/AddRecipeMenuPage",
  component: AddRecipeMenuPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AddRecipeMenuPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Menu: Story = {
  render: () => (
    <Viewport>
      <AddRecipeMenuPage options={addRecipeMenuFixture.options} />
    </Viewport>
  ),
};
