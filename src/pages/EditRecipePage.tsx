import type { ReactNode } from "react";
import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";

/**
 * EditRecipePage (#124, B3a): the shell half of Eciperay's edit
 * recipe screen — the container and the "Edit Recipe"
 * heading around the recipe form (RecipeFormPage, rendered by the
 * app host as this page's children — the shell/body split the app
 * screens have: the screen's host owns the form state, this page
 * owns the chrome). The app screen keeps the recipe query and the
 * save mutation. Mirrors the app's EditRecipeView shell
 * control-for-control.
 *
 * Native scroll ownership (#547, PR #556 review): the shell is
 * in "content" mode — a bounded frame with no ScrollView of its
 * own — because the composed RecipeFormPage's ScrollRegion is
 * the screen's single native scroller; a default shell here
 * nested that region inside the shell's ScrollView.
 */
export function EditRecipePage({
  children,
  footer,
}: {
  children: ReactNode;
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
}) {
  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <ScreenContainer>
        <Text variant="heading">Edit Recipe</Text>
        {children}
      </ScreenContainer>
    </BigFooterShell>
  );
}
