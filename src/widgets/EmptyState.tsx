import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { politeLiveRegionProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type EmptyStateProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Announce this empty state as a polite status message when it
   * appears — for empty states that are the RESULT of an action
   * (e.g. a completed search with no matches), which screen-reader
   * users otherwise have to navigate to discover. Leave unset for
   * empty states that are simply an initial list state.
   */
  announce?: boolean;
};

/**
 * Empty-state composition: title, optional body, optional action.
 * Used for empty lists, empty search results, and "nothing due" states.
 * With `announce`, the container carries `politeLiveRegionProps`
 * (`role="status"` on web, `accessibilityLiveRegion="polite"` on
 * native — the SecretRevealPanel pattern).
 */
export function EmptyState({ title, body, actionLabel, onAction, announce }: EmptyStateProps) {
  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      gap={tokens.spacing[2]}
      padding={tokens.spacing[6]}
      {...(announce ? politeLiveRegionProps : null)}
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
