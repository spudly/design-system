import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card, type CardProps } from "./Card.js";
import { Text } from "./Text.js";

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
export function SectionCard({ title, action, children, ...rest }: SectionCardProps) {
  return (
    <Card {...rest}>
      <YStack paddingBottom={tokens.spacing[3]}>
        <XStack justifyContent="space-between" alignItems="center" gap={tokens.spacing[2]}>
          <Text variant="subheading">{title}</Text>
          {action}
        </XStack>
      </YStack>
      <YStack gap={tokens.spacing[3]}>{children}</YStack>
    </Card>
  );
}
