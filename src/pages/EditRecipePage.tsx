import type { ReactNode } from "react";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * EditRecipePage (#124, B3a): the shell half of Eciperay's edit
 * recipe screen — the scrolling container and the "Edit Recipe"
 * heading around the recipe form (RecipeFormPage, rendered by the
 * app host as this page's children — the shell/body split the app
 * screens have: the screen's host owns the form state, this page
 * owns the chrome). The app screen keeps the recipe query and the
 * save mutation. Mirrors the app's EditRecipeView shell
 * control-for-control.
 */
export function EditRecipePage({ children }: { children: ReactNode }) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">Edit Recipe</Text>
      {children}
    </ScreenContainer>
  );
}
