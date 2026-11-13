import type { ReactNode } from "react";
import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";
import { useVoice } from "../voice/index.js";

/**
 * ManualEntryPage (#124, B3a): the shell half of Eciperay's
 * manual recipe creation screen — the container and
 * the heading around the recipe form (read from the
 * voice object, #539)
 * (RecipeFormPage, rendered by the app host as this page's
 * children — the shell/body split the app screens have). The app
 * screen keeps the create mutation and the post-create image
 * upload. Mirrors the app's ManualEntryView shell
 * control-for-control.
 *
 * Native scroll ownership (#547, PR #556 review): the shell is
 * in "content" mode — a bounded frame with no ScrollView of its
 * own — because the composed RecipeFormPage's ScrollRegion is
 * the screen's single native scroller; a default shell here
 * nested that region inside the shell's ScrollView.
 */
export function ManualEntryPage({
  children,
  footer,
}: {
  children: ReactNode;
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
}) {
  const voice = useVoice();
  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <ScreenContainer>
        <Text variant="heading">{voice.manualEntryPage.heading}</Text>
        {children}
      </ScreenContainer>
    </BigFooterShell>
  );
}
