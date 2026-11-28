import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { keyboardActivationHandler } from "../keyboardActivation.js";

import { Text } from "./Text.js";

export type MarkableRowProps = {
  /** The row's label. */
  label: string;
  /** Optional meta line under the label, pre-composed by the
   * caller (e.g. a quantity/nutrition line) — the ListItem
   * title/subtitle composition, for plain rows that carry
   * more than a name (#440). */
  subtitle?: string;
  /** Optional note at the row's trailing edge (e.g. "optional"). */
  trailingNote?: string;
  /**
   * The row's marked state: the row stays pressable, so a marked
   * row can be un-marked by pressing it again. This is not a
   * disabled state — activation is the point of the mark. The
   * row's text is never dimmed (#721 fidelity round): a pressable
   * row's leading checkbox box shows the state — the #713
   * CheckboxField box (unfilled terracotta outline in both
   * states, a terracotta check while marked).
   */
  isMarked?: boolean;
  /**
   * Press callback (typically toggling the mark). Omit it and
   * the row renders as a plain row with no activation.
   */
  onPress?: () => void;
};

/**
 * A pressable hairline row a tap marks and un-marks (#119): a
 * label with an optional trailing note, its text never dimmed —
 * the checklist row of shopping lists, packing lists, and
 * ingredient lists (RecipeDetailPage's ingredients render
 * through it; PublicRecipePage's identical rows adopt it with
 * that page's tranche). Extracted so pages compose markable
 * lists without hand-rolling pressable row styles; all content
 * is caller-supplied, so the row serves any app's lists.
 *
 * The checkbox box (#721, the recipe-detail visual direction,
 * converged on the #713 CheckboxField design in the fidelity
 * round): a pressable row leads with an unfilled 24px rounded
 * box — a terracotta ($primary) outline in BOTH states and a
 * terracotta check while marked, no fill in either state — and
 * the row's text never dims. (The first #721 round's filled-box
 * stopgap and the old missing-mark dim are both gone.) A row
 * with no press handler is a plain row and renders no box.
 *
 * Activation follows the ListItem press pattern: the row carries
 * the button role, is focusable on web, and the button keys
 * (Enter and Space) invoke the same callback as a press. The
 * press form announces itself as a checkbox whose checked state
 * is the mark, matching the box it draws.
 */
export function MarkableRow({
  label,
  subtitle,
  trailingNote,
  isMarked = false,
  onPress,
}: MarkableRowProps) {
  const handleKeyDown = keyboardActivationHandler(() => onPress?.());
  return (
    <Row
      middle
      {...(onPress ? { gap: "m" as const } : {})}
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      py="m"
      {...(onPress
        ? {
            ...platformAccessibilityProps({
              accessibilityRole: "checkbox",
              accessibilityState: { checked: isMarked },
            }),
            onPress,
            tabIndex: 0,
            onKeyDown: handleKeyDown,
            cursor: "web:pointer" as const,
          }
        : null)}
    >
      {onPress ? (
        <Col
          center
          middle
          width={tokens.spacing[6]}
          height={tokens.spacing[6]}
          borderRadius={tokens.radii.sm}
          borderWidth={2}
          borderColor="$primary"
          backgroundColor="$surface"
        >
          {isMarked ? (
            <Text fontSize={tokens.typography.fontSize.sm} color="$primary">
              ✓
            </Text>
          ) : null}
        </Col>
      ) : null}
      {subtitle ? (
        <Col grow shrink>
          <Text>{label}</Text>
          <Text variant="hint">{subtitle}</Text>
        </Col>
      ) : (
        <Text flex={1}>{label}</Text>
      )}
      {trailingNote ? (
        <Row>
          <Spacer x="s" />
          <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted">
            {trailingNote}
          </Text>
        </Row>
      ) : null}
    </Row>
  );
}
