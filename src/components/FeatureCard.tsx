import { Card } from "./Card.js";
import { Text } from "./Text.js";

export type FeatureCardContent = {
  title: string;
  description: string;
};

export type FeatureCardProps = {
  /** The feature: its title and description copy. */
  feature: FeatureCardContent;
};

/**
 * A feature card (#119): a Card holding a feature's title and
 * description, flexing to share a CardGrid row — the grid's wrap
 * basis (260px) lives here, so the cards size themselves and the
 * grid only wraps them. Extracted from LandingPage for the #119
 * page de-styling program: the card's flex, basis, inner gap, and
 * muted description ink are the feature card's design, owned
 * here; the copy is the caller's content.
 */
export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <Card flex={1} flexBasis={260} gap="$2">
      <Text variant="subheading">{feature.title}</Text>
      <Text color="$textMuted">{feature.description}</Text>
    </Card>
  );
}
