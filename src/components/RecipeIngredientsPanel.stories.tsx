import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import {
  RecipeIngredientsPanel,
  type RecipeIngredientsPanelView,
} from "./RecipeIngredientsPanel.js";

const meta: Meta<typeof RecipeIngredientsPanel> = {
  title: "Components/RecipeIngredientsPanel",
  component: RecipeIngredientsPanel,
};

export default meta;
type Story = StoryObj<typeof RecipeIngredientsPanel>;

function IngredientsDemo({
  initial,
}: {
  initial: Omit<
    RecipeIngredientsPanelView,
    "servings" | "onServingsChange" | "scaleValue" | "onScaleChange"
  >;
}) {
  const [servings, setServings] = useState(4);
  const [scaleValue, setScaleValue] = useState("1");
  return (
    <RecipeIngredientsPanel
      ingredients={{
        ...initial,
        servings,
        onServingsChange: setServings,
        scaleValue,
        onScaleChange: setScaleValue,
      }}
    />
  );
}

export const Default: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <IngredientsDemo
        initial={{
          ingredients: [
            { id: "chicken", label: "1 1/2 lb chicken breasts, sliced" },
            { id: "garlic", label: "4 garlic cloves, minced" },
            { id: "cream", label: "1 cup heavy cream", isMissing: true },
            { id: "parmesan", label: "1/2 cup Parmesan cheese, grated", isOptional: true },
          ],
          onIngredientPress: () => undefined,
          substitutions: [
            {
              ingredient: "Heavy cream",
              suggestions: "Half-and-half, evaporated milk, or coconut cream",
            },
          ],
        }}
      />
    </YStack>
  ),
};

export const Plain: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <IngredientsDemo
        initial={{
          ingredients: [
            { id: "pasta", label: "spaghetti" },
            { id: "tomatoes", label: "crushed tomatoes" },
          ],
        }}
      />
    </YStack>
  ),
};
