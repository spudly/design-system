import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealDetailFixture } from "./fixtures.js";
import { MealDetailPage } from "./MealDetailPage.js";

/**
 * Stories for the real MealDetailPage (#125): the fixture's
 * third member carries the unavailable state (access lost),
 * so the default story pins the suffix + non-pressable row
 * alongside the pressable ones. Theme pinned to Warm
 * Harvest.
 */
const meta: Meta<typeof MealDetailPage> = {
  title: "Pages/Eciperay/MealDetailPage",
  component: MealDetailPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealDetailPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const fixture = mealDetailFixture;

export const Default: Story = {
  render: () => (
    <Viewport>
      <MealDetailPage
        title={fixture.title}
        notes={fixture.notes}
        nutritionLabel={fixture.nutritionLabel}
        members={fixture.members}
        onCook={() => undefined}
        onEdit={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};

export const NoNotesOrNutrition: Story = {
  render: () => (
    <Viewport>
      <MealDetailPage
        title={fixture.title}
        members={fixture.members.slice(0, 1)}
        onCook={() => undefined}
        onEdit={() => undefined}
        onRecipePress={() => undefined}
      />
    </Viewport>
  ),
};
