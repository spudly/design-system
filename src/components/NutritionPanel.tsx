import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type NutritionPanelRow = {
  label: string;
  /** App-formatted value with unit ("520 kcal"). */
  valueLabel: string;
};

export type NutritionPanelData =
  | { state: "loading" }
  | {
      state: "unavailable";
      isRefreshing?: boolean;
      onEstimatePress?: () => void;
    }
  | {
      state: "ready";
      rows: NutritionPanelRow[];
      disclaimer: string;
      isRefreshing?: boolean;
      /** Background refetch in flight: Refresh disables alongside
       * an explicit refresh, as in the app. */
      isFetching?: boolean;
      onRefreshPress?: () => void;
    };

export type NutritionPanelProps = {
  /** The nutrition view-model: a loading / unavailable / ready union. */
  nutrition: NutritionPanelData;
};

function NutritionRow({ label, valueLabel }: NutritionPanelRow) {
  return (
    <XStack
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
    >
      <Text fontSize={tokens.typography.fontSize.md} color={tokens.colors.gray.gray8}>
        {label}
      </Text>
      <Text
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.semibold}
        color={tokens.colors.gray.gray10}
      >
        {valueLabel}
      </Text>
    </XStack>
  );
}

/**
 * The nutrition panel (#119): a per-serving nutrition section
 * in three states — a loading line, an unavailable state with
 * an Estimate action, and the ready state (a "Per Serving"
 * header with an optional Refresh action, one hairline
 * label/value row per nutrient, and the disclaimer). Extracted
 * from RecipeDetailPage's nutrition section; the panel owns its
 * internal rhythm outright, while the inset belongs to the
 * composing section stack (the panel renders flush, the same
 * rule the canonical SectionHeading follows). The row values
 * are caller-supplied pre-composed strings, so the panel serves
 * any app's nutrition displays.
 */
export function NutritionPanel({ nutrition }: NutritionPanelProps) {
  if (nutrition.state === "loading") {
    return <Text color="$textMuted">Estimating nutrition…</Text>;
  }
  if (nutrition.state === "unavailable") {
    return (
      <YStack>
        <YStack paddingBlockEnd="$3">
          <Text color="$textMuted">Nutrition is not available yet.</Text>
        </YStack>
        {nutrition.onEstimatePress ? (
          <Button
            variant="secondary"
            backgroundColor={tokens.colors.gray.gray10}
            color={tokens.colors.gray.gray1}
            disabled={nutrition.isRefreshing ?? false}
            onPress={nutrition.onEstimatePress}
          >
            {nutrition.isRefreshing ? "Refreshing…" : "Estimate nutrition"}
          </Button>
        ) : null}
      </YStack>
    );
  }
  return (
    <YStack>
      <XStack paddingBlockEnd="$3" alignItems="center" justifyContent="space-between" gap="$3">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          letterSpacing={0.35}
          color={tokens.colors.gray.gray6}
          textTransform="uppercase"
        >
          Per Serving
        </Text>
        {nutrition.onRefreshPress ? (
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={tokens.colors.gray.gray2}
            color={tokens.colors.gray.gray9}
            disabled={(nutrition.isRefreshing ?? false) || (nutrition.isFetching ?? false)}
            onPress={nutrition.onRefreshPress}
          >
            {nutrition.isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
        ) : null}
      </XStack>
      {nutrition.rows.map((row) => (
        <NutritionRow key={row.label} label={row.label} valueLabel={row.valueLabel} />
      ))}
      <YStack paddingBlockStart="$4">
        <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted">
          {nutrition.disclaimer}
        </Text>
      </YStack>
    </YStack>
  );
}
