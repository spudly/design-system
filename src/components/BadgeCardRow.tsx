import type { TagColorName } from "../themes/tagColors.js";
import { Badge } from "./Badge.js";
import { Card } from "./Card.js";
import { TextAction } from "./TextAction.js";
import { TrailingActionsRow } from "./TrailingActionsRow.js";

export type BadgeCardRowAction = {
  /** The action's visible text ("Edit", "Delete"). */
  label: string;
  /** The action's accessible name, composed by the caller from
   * the row's content ("Edit tag Weeknight"). */
  accessibilityLabel: string;
  /** The action's text treatment: "error" for destructive
   * actions, the default treatment otherwise. */
  variant?: "error";
  onPress: () => void;
};

export type BadgeCardRowProps = {
  /** The badge's text. */
  badgeLabel: string;
  /** The badge's color: a DS tag color token name (#207). */
  badgeColor: TagColorName;
  /** The row's trailing text actions, in order. */
  actions: BadgeCardRowAction[];
};

/**
 * A compact card row presenting a colored badge with trailing
 * text actions (#119): the tag-management row shape — a Badge
 * in its colored-tag form at the start, its Edit / Delete
 * rendered through TextAction at the end (the #248 treatment:
 * actions are button-role text controls), the two groups
 * spread across a compact Card (Card's `compact` variant)
 * through TrailingActionsRow, so the row wraps at narrow
 * widths instead of squeezing.
 *
 * The row exists as a component because the badge's color is
 * content, not a page-level concern: pages pass the badge's
 * label and color name plus the actions as data, and the row
 * renders the badge itself. Any list whose rows are a colored
 * badge plus lightweight actions — tags, categories, labels —
 * composes the same row.
 */
export function BadgeCardRow({ badgeLabel, badgeColor, actions }: BadgeCardRowProps) {
  return (
    <Card variant="compact">
      <TrailingActionsRow leading={<Badge color={badgeColor}>{badgeLabel}</Badge>}>
        {actions.map((action) => (
          <TextAction
            key={action.label}
            {...(action.variant ? { variant: action.variant } : {})}
            accessibilityLabel={action.accessibilityLabel}
            onPress={action.onPress}
          >
            {action.label}
          </TextAction>
        ))}
      </TrailingActionsRow>
    </Card>
  );
}
