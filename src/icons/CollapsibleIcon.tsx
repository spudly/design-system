import { CollapsedIcon } from "./CollapsedIcon.js";
import { ExpandedIcon } from "./ExpandedIcon.js";
import type { IconComponentProps } from "./Icon.js";

export type CollapsibleIconProps = IconComponentProps & {
  /** Whether the disclosure this icon marks is currently expanded. */
  isOpen: boolean;
};

/**
 * The disclosure indicator for collapsible content: ExpandedIcon
 * while open, CollapsedIcon while closed. Carries no glyph data of
 * its own — it composes the two state icons (Stephen's split of the
 * accordion chevron, spudly/design-system#250).
 */
export function CollapsibleIcon({ isOpen, ...props }: CollapsibleIconProps) {
  return isOpen ? <ExpandedIcon {...props} /> : <CollapsedIcon {...props} />;
}
