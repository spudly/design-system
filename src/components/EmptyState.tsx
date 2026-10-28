import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type EmptyStateProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Empty-state composition: title, optional body, optional action.
 * Used for empty lists, empty search results, and "nothing due" states.
 */
export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap={tokens.spacing[2]}
      padding={tokens.spacing[6]}
    >
      <Text variant="subheading">{title}</Text>
      {body ? (
        <Text variant="hint" textAlign="center">
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </YStack>
  );
}
