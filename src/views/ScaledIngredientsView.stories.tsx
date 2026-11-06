import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { tokens } from "../tokens/index.js";
import { ScaledIngredientsView } from "./ScaledIngredientsView.js";

const meta: Meta<typeof ScaledIngredientsView> = {
  title: "Views/ScaledIngredientsView",
  component: ScaledIngredientsView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ScaledIngredientsView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4" backgroundColor={tokens.colors.gray.gray10}>
      {children}
    </View>
  );
}

export const OnOverlay: Story = {
  render: () => (
    <Viewport>
      <ScaledIngredientsView
        heading="Ingredients · 4 servings (scaled ×2)"
        lines={[
          "2 lb chicken thighs",
          "2 tbsp olive oil",
          "1 cup tomato sauce",
          "1 tsp smoked paprika",
          "1/2 tsp salt",
        ]}
      />
    </Viewport>
  ),
};
