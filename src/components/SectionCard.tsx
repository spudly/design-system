import type { ReactNode } from "react";
import { XStack } from "tamagui";
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
      <XStack
        justifyContent="space-between"
        alignItems="center"
        gap={tokens.spacing[2]}
        marginBottom={tokens.spacing[3]}
      >
        <Text variant="subheading">{title}</Text>
        {action}
      </XStack>
      {children}
    </Card>
  );
}
