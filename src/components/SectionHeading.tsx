import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type SectionHeadingProps = {
  /** The heading's label. */
  children: string;
};

/**
 * A bare section heading (#119): the label a single-scroll
 * detail page scans by — one section's name standing over its
 * panel, at the panel's horizontal inset, with the heading's
 * own offset above it (the separation from the previous panel
 * is the heading's trait, as a SectionCard's title spacing is
 * the card's). Extracted from RecipeDetailPage's section
 * headings, which PublicRecipePage renders identically; the
 * heading owns its treatment (large, semibold) outright, so
 * pages pass only the label.
 */
export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <YStack paddingBlockStart="$2">
      <Text
        paddingHorizontal="$4"
        fontSize={tokens.typography.fontSize.lg}
        fontWeight={tokens.typography.fontWeight.semibold}
        color={tokens.colors.gray.gray10}
      >
        {children}
      </Text>
    </YStack>
  );
}
