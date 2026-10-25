import type { ReactNode } from "react";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * ManualEntryPage (#124, B3a): the shell half of Eciperay's
 * manual recipe creation screen — the scrolling container and
 * the "Manual Entry" heading around the recipe form
 * (RecipeFormPage, rendered by the app host as this page's
 * children — the shell/body split the app screens have). The app
 * screen keeps the create mutation and the post-create image
 * upload. Mirrors the app's ManualEntryView shell
 * control-for-control.
 */
export function ManualEntryPage({ children }: { children: ReactNode }) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">Manual Entry</Text>
      {children}
    </ScreenContainer>
  );
}
