import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * EditRecipePage (#124, B3a): the shell half of Eciperay's edit
 * recipe screen — the scrolling container and the "Edit Recipe"
 * heading around the shared recipe form (RecipeFormPage). The app
 * screen keeps the recipe query and the save mutation; this page
 * is the view it renders. Mirrors the app's EditRecipeView shell
 * control-for-control.
 */
export function EditRecipePage(props: RecipeFormPageProps) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">Edit Recipe</Text>
      <RecipeFormPage {...props} />
    </ScreenContainer>
  );
}
