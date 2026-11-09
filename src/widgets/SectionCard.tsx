import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card, type CardProps } from "./Card.js";
import { useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

export type SectionCardProps = CardProps & {
  title: string;
  /** Optional trailing element in the header row, e.g. an "Edit" button. */
  action?: ReactNode;
};

/**
 * Titled card section: a Card with a subheading title row and spacing below
 * it. Pass `action` for a trailing header element such as an Edit button.
 * Appearance comes from Card's `variant` prop ("default" | "bordered" |
 * "muted" | "elevated"), passed through via {@link SectionCardProps}.
 */
export function SectionCard({
  title,
  action,
  children,
  loading = false,
  ...rest
}: SectionCardProps) {
  // Loading (#278): the header title swaps for a text skeleton
  // and the header action is hidden; the Card shell carries the
  // busy state and provides the LoadingScope, so the section's
  // own widgets skeletonize without prop-drilling. `loading`
  // arrives through CardProps (SectionCardProps extends it), and
  // an enclosing composite's LoadingScope puts the section into
  // the same state (the showSkeleton pattern every other
  // converted widget uses — CodeRabbit on #551).
  const showSkeleton = useLoadingScope(loading);
  return (
    <Card loading={showSkeleton} {...rest}>
      <YStack paddingBottom={tokens.spacing[3]}>
        <XStack justifyContent="space-between" alignItems="center" gap={tokens.spacing[2]}>
          {showSkeleton ? (
            <YStack flex={1}>
              <TextSkeleton lines={1} />
            </YStack>
          ) : (
            <Text variant="subheading">{title}</Text>
          )}
          {showSkeleton ? null : action}
        </XStack>
      </YStack>
      <YStack gap={tokens.spacing[3]}>{children}</YStack>
    </Card>
  );
}
