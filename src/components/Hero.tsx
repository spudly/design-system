import { YStack } from "tamagui";
import { Text } from "./Text.js";

export type HeroProps = {
  /** The hero's headline (the page's title-level heading). */
  title: string;
  /** The supporting line under the headline. */
  subtitle: string;
};

/**
 * A page hero (#119): the title-level heading and its supporting
 * line, centered, with the hero's top breathing room. Extracted
 * from LandingPage for the #119 page de-styling program — the
 * centering, the muted subtitle ink, and the top padding are the
 * hero's design, owned here; the copy is the caller's content.
 */
export function Hero({ subtitle, title }: HeroProps) {
  return (
    <YStack alignItems="center" gap="$3" paddingTop="$6">
      <Text variant="heading" textAlign="center">
        {title}
      </Text>
      <Text color="$textMuted" textAlign="center">
        {subtitle}
      </Text>
    </YStack>
  );
}
