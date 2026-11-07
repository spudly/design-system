import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { mainRoleProps } from "./accessibility.js";

export type MainLandmarkProps = {
  /** The page's primary content, rendered inside the landmark. */
  children: ReactNode;
};

/**
 * A page's `main` landmark region (#366, #473): a flex column
 * that fills the space its shell leaves it and carries the web
 * `main` role (via `mainRoleProps` from the shared accessibility
 * translation; empty on native, where the role does not exist).
 *
 * The landmark is a component, not a page treatment, for the
 * same reason ScrollRegion is: a page composes it without
 * rendering a layout primitive or spreading a role prop itself
 * (#119). Exactly one MainLandmark renders per surface — the
 * outermost frame owns it. LegalDocumentPage predates this
 * component and carries its own column's landmark inline; the
 * public recipe surface adopts this component because #473
 * retired the PublicPageFrame page whose layout owned the
 * landmark before: with no host-side frame, the page composes
 * MainLandmark around every state's content, and the footer
 * (BigFooterShell's `contentinfo`) stays outside it.
 */
export function MainLandmark({ children }: MainLandmarkProps) {
  return (
    <YStack flex={1} {...mainRoleProps}>
      {children}
    </YStack>
  );
}
