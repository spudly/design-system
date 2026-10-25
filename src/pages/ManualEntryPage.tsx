import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * ManualEntryPage (#124, B3a): the shell half of Eciperay's manual
 * recipe creation screen — the scrolling container and the
 * "Manual Entry" heading around the shared recipe form
 * (RecipeFormPage). The app screen keeps the create mutation and
 * the post-create image upload; this page is the view it renders.
 * Mirrors the app's ManualEntryView shell control-for-control.
 */
export function ManualEntryPage(props: RecipeFormPageProps) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">Manual Entry</Text>
      <RecipeFormPage {...props} />
    </ScreenContainer>
  );
}
