import type { ReactNode } from "react";
import { isWeb } from "tamagui";
import { Col } from "./Col.js";
import { mainRoleProps } from "../accessibility.js";

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
 * recipe page adopts this component because #473
 * retired the PublicPageFrame page whose layout owned the
 * landmark before: with no host-side frame, the page composes
 * MainLandmark around its public-treatment states' content
 * (RecipeDetailPage's guest mode and its notFound / unavailable
 * message states, since #757), and the footer
 * (BigFooterShell's `contentinfo`) stays outside it.
 *
 * Sizing follows the #547 page-scroll model, like the page
 * frame and ScrollRegion: on native the column fills the space its
 * shell leaves it (`flex: 1` inside the shell's bounded frame);
 * on web the document scrolls the whole page, so the column
 * grows with its content — `flex: 1`'s zero basis collapsed it
 * inside BigFooterShell's unbounded space-between column and
 * left the recipe page's footer at the viewport's bottom edge
 * while its content overflowed past (the rendered-Storybook
 * audit on PR #556).
 */
export function MainLandmark({ children }: MainLandmarkProps) {
  if (isWeb) {
    return (
      <Col grow {...mainRoleProps}>
        {children}
      </Col>
    );
  }
  return (
    <Col grow shrink {...mainRoleProps}>
      {children}
    </Col>
  );
}
