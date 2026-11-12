import { ScrollView, YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { tokens } from "../tokens/index.js";

export type ScaledIngredientsViewProps = {
  /** The panel's heading line, pre-composed by the caller ("Ingredients · 4 servings (scaled ×2)"). */
  heading: string;
  /** The scaled ingredient lines, pre-formatted by the caller. */
  lines: string[];
  /** Loading state (#278): the heading renders as a text
   * skeleton at its own (sm) size and the lines as one text
   * skeleton per line at sm — or exactly 3 dummy line bones
   * when no lines are known yet — inside the same translucent
   * panel frame, with no real heading or ingredient text. An
   * enclosing composite's LoadingScope can also put the panel
   * into this state without prop-drilling. */
  loading?: boolean;
};

// The loading panel's dummy lines (#278): exactly 3 placeholder
// lines when none are known, from a frozen module-level
// constant — never generated per render. A loading panel over
// known lines mirrors its own lines instead (one bone per line).
const LOADING_LINE_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * ScaledIngredientsView (#438 Part 3): the cooking mode's
 * scaled-ingredients panel as a view — a translucent panel on
 * the step overlay carrying the heading and the scrollable,
 * pre-formatted ingredient lines — composed so the recipe
 * CookingModePage renders it through StepOverlay's accessory
 * slot and hosts no longer compose Text on the overlay
 * themselves (the eciperay audit's coverage disposition for
 * that specifier).
 *
 * Scaling and formatting stay with the caller: the heading
 * and lines cross pre-composed, the same view-model rule the
 * cooking pages keep for step bodies. The panel's dark
 * treatment composes the theme's $surface at layered opacity
 * (the RatingForm dark variant's precedent), so it stays
 * theme-correct on the overlay's dark shell.
 */
export function ScaledIngredientsView({
  heading,
  lines,
  loading = false,
}: ScaledIngredientsViewProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <YStack borderRadius={tokens.radii.xl} overflow="hidden">
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="$surface"
        opacity={0.05}
      />
      <YStack
        padding="$3"
        gap="$2"
        {...(showSkeleton
          ? platformAccessibilityProps({ accessibilityState: { busy: true } })
          : {})}
      >
        {showSkeleton ? (
          <TextSkeleton size="sm" lines={1} />
        ) : (
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.semibold}
            color="$surface"
          >
            {heading}
          </Text>
        )}
        <ScrollView maxHeight={160} nestedScrollEnabled>
          <YStack gap="$1">
            {showSkeleton
              ? lines.length > 0
                ? lines.map((_, index) => <TextSkeleton key={index} size="sm" lines={1} />)
                : LOADING_LINE_KEYS.map((key) => <TextSkeleton key={key} size="sm" lines={1} />)
              : lines.map((line, index) => (
                  <Text key={index} fontSize={tokens.typography.fontSize.sm} color="$surface">
                    {line}
                  </Text>
                ))}
          </YStack>
        </ScrollView>
      </YStack>
    </YStack>
  );
}
