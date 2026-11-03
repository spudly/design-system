import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { ActionBar } from "./ActionBar.js";
import { Button } from "./Button.js";
import { Alert } from "./Alert.js";

export type FixedActionBannerAction = {
  label: string;
  onPress: () => void;
};

export type FixedActionBannerProps = {
  /** Banner content; a ReactNode so callers can compose text and links. */
  message: ReactNode;
  primaryAction?: FixedActionBannerAction;
  secondaryAction?: FixedActionBannerAction;
  /** Optional: without it the banner renders no dismiss control. */
  onDismiss?: () => void;
  dismissAriaLabel?: string;
  /** Which screen edge the bar pins to (the ActionBar placement). */
  position?: "top" | "bottom";
};

/**
 * Pinned action banner (consent bars, install prompts): the DS ActionBar
 * pinned to a screen edge, holding an info Alert above a wrapping
 * row of actions — secondary first, then primary, then an optional ghost
 * dismiss button labeled "Dismiss". Content sits in a centered column
 * capped at 1024px so the bar reads the same on wide screens.
 *
 * Pinning is viewport-fixed on web (#405): an absolutely-positioned bar
 * pins to its nearest positioned ancestor and scrolls with the document,
 * so a consent bar could scroll out of view; `position: "fixed"` keeps
 * it at the viewport edge at any scroll position. On native there is no
 * viewport/document split — absolute edge-pinning inside the full-screen
 * container is correct — so the native form keeps ActionBar's absolute
 * default via the platform-conditional position below.
 *
 * This exists alongside Alert because that component's contract cannot
 * express this shape: it is not pinned to a screen edge, and every one
 * of its actions renders as a secondary button (design-system #123,
 * gap 1).
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
    <ActionBar
      placement={position}
      // #405: viewport-fixed on web, absolute on native (see the
      // component doc above). Tamagui v3's conditional-object syntax
      // resolves `web` on web builds and `default` elsewhere; verified
      // in SSR output (the generated CSS carries position:fixed for
      // this bar's class).
      position={{ default: "absolute", web: "fixed" }}
    >
      <YStack width="100%" maxWidth={1024} alignSelf="center" gap="$3">
        <Alert severity="info">{message}</Alert>
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
