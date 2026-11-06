import { ScrollView, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { tokens } from "../tokens/index.js";

export type ScaledIngredientsViewProps = {
  /** The panel's heading line, pre-composed by the caller ("Ingredients · 4 servings (scaled ×2)"). */
  heading: string;
  /** The scaled ingredient lines, pre-formatted by the caller. */
  lines: string[];
};

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
export function ScaledIngredientsView({ heading, lines }: ScaledIngredientsViewProps) {
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
      <YStack padding="$3" gap="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          color="$surface"
        >
          {heading}
        </Text>
        <ScrollView maxHeight={160}>
          <YStack gap="$1">
            {lines.map((line, index) => (
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
