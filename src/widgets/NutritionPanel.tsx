import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

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
  /** Loading state (#278): the panel renders skeletons mirroring
   * the ready layout (header, one row per nutrient, disclaimer),
   * regardless of which union state it carries. The view-model's
   * own `loading` state renders the same skeletons. An enclosing
   * composite's LoadingScope can also put the panel into this
   * state without prop-drilling. */
  loading?: boolean;
};

// The loading panel's dummy rows (#278): exactly 3 placeholder
// rows when the ready rows are not known (the view-model's
// loading / unavailable states), from a frozen module-level
// constant with stable keys — never generated per render. A
// loading panel over ready data mirrors its own row count.
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

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
 * in three states — a skeleton state mirroring the ready layout
 * (#278; the plain loading line it rendered before is gone), an
 * unavailable state with an Estimate action, and the ready state
 * (a "Per Serving" header with an optional Refresh action, one
 * hairline label/value row per nutrient, and the disclaimer).
 * Extracted from RecipeDetailPage's nutrition section; the panel
 * owns its internal rhythm outright, while the inset belongs to
 * the composing section stack (the panel renders flush, the same
 * rule the canonical SectionHeading follows). The row values
 * are caller-supplied pre-composed strings, so the panel serves
 * any app's nutrition displays.
 */
export function NutritionPanel({ nutrition, loading = false }: NutritionPanelProps) {
  const showSkeleton = useLoadingScope(loading) || nutrition.state === "loading";
  if (showSkeleton) {
    // Loading (#278): the ready layout's skeleton — the header
    // row (its Refresh action, when the ready data carries one,
    // stays in place as an inert rectangle skeleton inside the
    // loading scope), one label/value row per nutrient (the
    // ready rows' own count, or exactly 3 dummy rows when the
    // rows are not known yet), and the disclaimer line. The
    // rows keep their geometry but their hairlines render
    // transparent — no visible dividers in the skeleton state —
    // and the region is marked busy. No real values show.
    const rowKeys =
      nutrition.state === "ready" && nutrition.rows.length > 0
        ? nutrition.rows.map((row) => row.label)
        : LOADING_ROW_KEYS;
    return (
      <LoadingScope active>
        <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
          <XStack paddingBlockEnd="$3" alignItems="center" justifyContent="space-between" gap="$3">
            <YStack flex={1}>
              <TextSkeleton size="sm" lines={1} />
            </YStack>
            {nutrition.state === "ready" && nutrition.onRefreshPress ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={(nutrition.isRefreshing ?? false) || (nutrition.isFetching ?? false)}
                onPress={nutrition.onRefreshPress}
              >
                {nutrition.isRefreshing ? "Refreshing…" : "Refresh"}
              </Button>
            ) : null}
          </XStack>
          {rowKeys.map((key) => (
            <XStack
              key={key}
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor="transparent"
              paddingVertical="$3"
              gap="$3"
            >
              <YStack flex={1}>
                <TextSkeleton size="md" lines={1} />
              </YStack>
              <View width={72}>
                <TextSkeleton size="md" lines={1} />
              </View>
            </XStack>
          ))}
          <YStack paddingBlockStart="$4">
            <TextSkeleton size="xs" lines={1} />
          </YStack>
        </YStack>
      </LoadingScope>
    );
  }
  if (nutrition.state === "unavailable") {
    return (
      <YStack>
        <YStack paddingBlockEnd="$3">
          <Text color="$textMuted">Nutrition is not available yet.</Text>
        </YStack>
        {nutrition.onEstimatePress ? (
          <Button
            variant="primary"
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
