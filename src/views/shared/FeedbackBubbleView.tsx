import type { ReactNode } from "react";

import { Button } from "../../widgets/actions/Button.js";
import { Col } from "../../widgets/layout/Col.js";
import { tokens } from "../../tokens/index.js";

export type FeedbackBubbleViewProps = {
  /** Whether the feedback panel is open. State stays with the host. */
  open: boolean;
  /** The bubble button was pressed: the host toggles `open`. */
  onToggle: () => void;
  /**
   * The panel's accessible name, and the bubble button's
   * accessible name. Defaults to the host implementation's
   * name, "Send feedback" (eciperay's local FeedbackBubble).
   */
  label?: string;
  /** The feedback form content, composed by the host (its FeedbackForm). */
  children?: ReactNode;
};

/**
 * FeedbackBubbleView (#876): the floating feedback bubble plus
 * its panel, as a view — the chrome eciperay used to hand-build
 * with a raw button and plain CSS (its local `FeedbackBubble`
 * and panel block), now owned by the DS so hosts mount the
 * whole surface from @spudly/ui and supply only the feedback
 * form content and the open state.
 *
 * Geometry matches the host implementation it replaces: the
 * stack pins to the viewport's bottom-right (80px up from the
 * bottom edge — clear of the host's bottom navigation — and
 * 16px in from the right), right-aligned with a 12px gap; the
 * panel is capped at 24rem wide (and at the viewport width
 * minus 2rem on narrow screens), a raised surface card with
 * 16px padding; the bubble is a 48px circular primary button
 * carrying the feedback glyph, named by `label`, reporting
 * `aria-expanded` for the panel it controls.
 *
 * Pinning follows the FixedActionBanner precedent (#405): on
 * web the stack is viewport-fixed so it stays put at any
 * scroll position; on native it pins absolute inside its
 * full-screen container. No feedback-form logic lives here —
 * submitting or cancelling the form closes the panel through
 * the host's own state, which it passes back in as `open`.
 */
export function FeedbackBubbleView({
  open,
  onToggle,
  label = "Send feedback",
  children,
}: FeedbackBubbleViewProps) {
  return (
    <Col
      position={{ default: "absolute", web: "fixed" }}
      zIndex={50}
      right
      gap="m"
      // eslint-disable-next-line design-system/no-page-styling -- floating-bubble anchor offsets (right/bottom) for the fixed overlay; no widget prop pair expresses both
      style={{ right: 16, bottom: 80 }}
    >
      {open ? (
        <Col
          role="dialog"
          aria-label={label}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={tokens.radii.xl}
          p="m"
          width={{ web: "min(100vw - 2rem, 24rem)" }}
          maxWidth={384}
          shadowColor={tokens.shadows.lg.shadowColor}
          shadowOffset={tokens.shadows.lg.shadowOffset}
          shadowOpacity={tokens.shadows.lg.shadowOpacity}
          shadowRadius={tokens.shadows.lg.shadowRadius}
        >
          {children}
        </Col>
      ) : null}
      <Button
        variant="primary"
        icon="feedback"
        accessibilityLabel={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onPress={onToggle}
        borderRadius={tokens.radii.full}
        shadowColor={tokens.shadows.lg.shadowColor}
        shadowOffset={tokens.shadows.lg.shadowOffset}
        shadowOpacity={tokens.shadows.lg.shadowOpacity}
        shadowRadius={tokens.shadows.lg.shadowRadius}
      />
    </Col>
  );
}
