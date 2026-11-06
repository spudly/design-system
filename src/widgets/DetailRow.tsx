import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type DetailRowProps = {
  /** The row's label, rendered muted on the leading edge. */
  label: string;
  /** The row's value, rendered on the trailing edge. */
  value: string;
};

/**
 * Label/value detail row: a muted label on the leading edge and its
 * value on the trailing edge, over a hairline — the row shape of a
 * detail screen's facts (MealPlanDetailPage's nutrition-goal
 * progress rows render through it). The label takes Text's `hint`
 * treatment and the value the same small size at the default tone;
 * the hairline and the row's vertical padding live here so pages
 * compose rows without styling them (#119).
 */
export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <XStack
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$2"
    >
      <Text variant="hint">{label}</Text>
      <Text fontSize={tokens.typography.fontSize.sm}>{value}</Text>
    </XStack>
  );
}
