import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import {
  RecipeIngredientsPanel,
  type RecipeIngredientsPanelView,
} from "./RecipeIngredientsPanel.js";

const meta: Meta<typeof RecipeIngredientsPanel> = {
  title: "Widgets/RecipeIngredientsPanel",
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
  const [ingredients, setIngredients] = useState(initial.ingredients);
  const hasMissing = ingredients.some((ingredient) => ingredient.isMissing);
  return (
    <RecipeIngredientsPanel
      ingredients={{
        servings,
        onServingsChange: setServings,
        scaleValue,
        onScaleChange: setScaleValue,
        ingredients,
        ...(initial.onIngredientPress
          ? {
              onIngredientPress: (ingredientId: string) => {
                setIngredients((current) =>
                  current.map((ingredient) =>
                    ingredient.id === ingredientId
                      ? { ...ingredient, isMissing: !ingredient.isMissing }
                      : ingredient,
                  ),
                );
              },
            }
          : {}),
        ...(initial.loadingSubstitutions
          ? { loadingSubstitutions: initial.loadingSubstitutions }
          : {}),
        ...(initial.substitutions && hasMissing ? { substitutions: initial.substitutions } : {}),
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

const LOADING_VIEW: RecipeIngredientsPanelView = {
  servings: 4,
  onServingsChange: () => {},
  scaleValue: "1",
  onScaleChange: () => {},
  ingredients: [
    { id: "chicken", label: "1 1/2 lb chicken breasts, sliced" },
    { id: "garlic", label: "4 garlic cloves, minced" },
    { id: "cream", label: "1 cup heavy cream", isMissing: true },
    { id: "parmesan", label: "1/2 cup Parmesan cheese, grated", isOptional: true },
  ],
  onIngredientPress: () => {},
  substitutions: [
    {
      ingredient: "Heavy cream",
      suggestions: "Half-and-half, evaporated milk, or coconut cream",
    },
  ],
};

export const Loading: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <RecipeIngredientsPanel ingredients={LOADING_VIEW} loading />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" width={640} maxWidth="100%">
      <RecipeIngredientsPanel ingredients={LOADING_VIEW} />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <RecipeIngredientsPanel ingredients={LOADING_VIEW} loading />
      </YStack>
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
