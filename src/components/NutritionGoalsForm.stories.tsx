import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { NutritionGoalsForm } from "./NutritionGoalsForm.js";
import { nutritionGoalsFixture } from "../pages/fixtures.js";

const meta: Meta<typeof NutritionGoalsForm> = {
  title: "Components/NutritionGoalsForm",
  component: NutritionGoalsForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof NutritionGoalsForm>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}


export const Filled: Story = {
  render: () => (
    <Viewport>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        onSave={() => undefined}
      />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        error="Could not save your goals. Try again."
        onSave={() => undefined}
      />
    </Viewport>
  ),
};
