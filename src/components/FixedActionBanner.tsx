import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { ActionBar } from "./ActionBar.js";
import { Button } from "./Button.js";
import { InlineAlert } from "./InlineAlert.js";

export interface FixedActionBannerAction {
  label: string;
  onPress: () => void;
}

export interface FixedActionBannerProps {
  /** Banner content; a ReactNode so callers can compose text and links. */
  message: ReactNode;
  primaryAction?: FixedActionBannerAction;
  secondaryAction?: FixedActionBannerAction;
  /** Optional: without it the banner renders no dismiss control. */
  onDismiss?: () => void;
  dismissAriaLabel?: string;
  /** Which screen edge the bar pins to (the ActionBar placement). */
  position?: "top" | "bottom";
}

/**
 * Pinned action banner (consent bars, install prompts): the DS ActionBar
 * pinned to a screen edge, holding an info InlineAlert above a wrapping
 * row of actions — secondary first, then primary, then an optional ghost
 * dismiss button labeled "Dismiss". Content sits in a centered column
 * capped at 1024px so the bar reads the same on wide screens.
 *
 * This exists alongside DismissibleBanner because that component's
 * contract cannot express this shape: its `message` is a plain string,
 * `onDismiss` is required, and every action renders as a secondary
 * button (design-system #123, gap 1).
 */
export function FixedActionBanner({
  message,
  primaryAction,
  secondaryAction,
  onDismiss,
  dismissAriaLabel = "Dismiss",
  position = "bottom",
}: FixedActionBannerProps) {
  return (
    <ActionBar placement={position}>
      <YStack width="100%" maxWidth={1024} alignSelf="center" gap="$3">
        <InlineAlert severity="info">{message}</InlineAlert>
        <XStack flexWrap="wrap" alignItems="center" gap="$2">
          {secondaryAction ? (
            <Button variant="secondary" onPress={secondaryAction.onPress}>
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button variant="primary" onPress={primaryAction.onPress}>
              {primaryAction.label}
            </Button>
          ) : null}
          {onDismiss ? (
            <Button
              variant="ghost"
              size="sm"
              accessibilityLabel={dismissAriaLabel}
              onPress={onDismiss}
            >
              Dismiss
            </Button>
          ) : null}
        </XStack>
      </YStack>
    </ActionBar>
  );
}
