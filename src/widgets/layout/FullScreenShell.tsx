import type { ReactNode } from "react";
import { isWeb } from "tamagui";
import { Col } from "./Col.js";

export type FullScreenShellProps = {
  children: ReactNode;
};

/**
 * The full-screen page frame (#752/#753): for pages that take
 * over the whole screen (the cooking-mode pages) and render
 * NO Big Footer at all — Stephen's direction (Storybook
 * review 2026-11-20) is that a full-screen view has no
 * marketing footer band and reserves no footer height.
 *
 * The frame is exactly BigFooterShell's "overlay" branch
 * (#729) minus the footer: on web a column bounded to the
 * full viewport (minHeight 100dvh) whose single content
 * region is positioned and full-width, so an
 * absolutely-positioned full-region child (StepOverlay)
 * anchors to the whole viewport — no 1200px column cap at
 * the sides, no collapsed unbounded column. On native there
 * is no document, so the frame is the bounded flex frame
 * itself and the content owns its scrolling, as in
 * BigFooterShell's content/overlay modes.
 */
export function FullScreenShell({ children }: FullScreenShellProps) {
  if (!isWeb) {
    return (
      <Col grow shrink position="relative">
        {children}
      </Col>
    );
  }
  return (
    <Col minHeight="100dvh">
      <Col grow shrink position="relative">
        {children}
      </Col>
    </Col>
  );
}
