import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type MarkableRowProps = {
  /** The row's label. */
  label: string;
  /** Optional note at the row's trailing edge (e.g. "optional"). */
  trailingNote?: string;
  /**
   * The row's marked state: the row renders dimmed but stays
   * pressable, so a marked row can be un-marked by pressing it
   * again. This is not a disabled state — activation is the
   * point of the mark.
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
 * label with an optional trailing note, dimmed while marked —
 * the checklist row of shopping lists, packing lists, and
 * ingredient lists (RecipeDetailPage's ingredients render
 * through it; PublicRecipePage's identical rows adopt it with
 * that page's tranche). Extracted so pages compose markable
 * lists without hand-rolling pressable row styles; all content
 * is caller-supplied, so the row serves any app's lists.
 *
 * Activation follows the ListRow press pattern: the row carries
 * the button role, is focusable on web, and the button keys
 * (Enter and Space) invoke the same callback as a press.
 */
export function MarkableRow({ label, trailingNote, isMarked = false, onPress }: MarkableRowProps) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress?.();
    }
  };
  return (
    <XStack
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
      opacity={isMarked ? 0.4 : 1}
      {...(onPress
        ? {
            ...platformAccessibilityProps({ accessibilityRole: "button" }),
            onPress,
            tabIndex: 0,
            onKeyDown: handleKeyDown,
            cursor: "web:pointer" as const,
          }
        : null)}
    >
      <Text flex={1}>{label}</Text>
      {trailingNote ? (
        <YStack paddingInlineStart="$2">
          <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted">
            {trailingNote}
          </Text>
        </YStack>
      ) : null}
    </XStack>
  );
}
