import type { ReactNode } from "react";
import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";

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
export function ManualEntryPage({
  children,
  footer,
}: {
  children: ReactNode;
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
}) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <Text variant="heading">Manual Entry</Text>
        {children}
      </ScreenContainer>
    </BigFooterShell>
  );
}
