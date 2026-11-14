import type { TagColorName } from "../themes/tagColors.js";
import { Badge } from "./Badge.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { TrailingActionsRow } from "./TrailingActionsRow.js";

type BadgeCardRowAction = {
  /** The action's visible text ("Edit", "Delete"). */
  label: string;
  /** The action's accessible name, composed by the caller from
   * the row's content ("Edit tag Weeknight"). */
  accessibilityLabel: string;
  /** The action's treatment: "error" for destructive
   * actions, the default treatment otherwise. */
  variant?: "error";
  onPress: () => void;
};

export type BadgeCardRowProps = {
  /** The badge's text. */
  badgeLabel: string;
  /** The badge's color: a DS tag color token name (#207). */
  badgeColor: TagColorName;
  /** The row's trailing actions, in order. */
  actions: BadgeCardRowAction[];
};

/**
 * A compact card row presenting a colored badge with trailing
 * actions (#119): the tag-management row shape — a Badge
 * in its colored-tag form at the start, its Edit / Delete
 * rendered as ghost Buttons at the end (the #248 treatment:
 * actions are buttons; #464 retired the TextAction text
 * control in favor of Button's ghost treatment), the two
 * groups spread across a compact Card (Card's `compact`
 * variant) through TrailingActionsRow, so the row wraps at
 * narrow widths instead of squeezing.
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
          <Button
            key={action.label}
            ghost
            size="sm"
            variant={action.variant === "error" ? "danger" : "primary"}
            accessibilityLabel={action.accessibilityLabel}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        ))}
      </TrailingActionsRow>
    </Card>
  );
}
