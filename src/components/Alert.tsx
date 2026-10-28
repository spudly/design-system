import type { ReactNode } from "react";
import { XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps, politeLiveRegionProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const severityStyles = {
  info: {
    background: "$primarySubtle",
    border: "$primary",
    text: "$primaryEmphasis",
  },
  success: {
    background: tokens.colors.success.success1,
    border: tokens.colors.success.success4,
    text: tokens.colors.success.success8,
  },
  warning: {
    background: tokens.colors.warning.warning1,
    border: tokens.colors.warning.warning4,
    text: tokens.colors.warning.warning8,
  },
  error: {
    background: tokens.colors.danger.danger1,
    border: tokens.colors.danger.danger4,
    text: tokens.colors.danger.danger8,
  },
} as const;

export type AlertSeverity = keyof typeof severityStyles;

const StyledAlert = styled(YStack, {
  name: "Alert",

  borderWidth: 1,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  gap: tokens.spacing[2],
});

type StyledAlertProps = GetProps<typeof StyledAlert>;

export type AlertAction = {
  label: string;
  onPress: () => void;
};

export type AlertProps = StyledAlertProps & {
  severity?: AlertSeverity;
  /** Plain-text message. Use `children` instead for rich content; children win when both are given. */
  message?: string;
  actions?: AlertAction[];
  /** Renders the dismiss (×) button; requires `onDismiss`. */
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: ReactNode;
};

/**
 * The single inline message component (consolidates the former InlineAlert
 * and DismissibleBanner — design-system #208). Severity styling covers
 * info / success / warning / error. `error` and `warning` announce via
 * `accessibilityRole="alert"` (valid on web and native alike); `info` and
 * `success` announce politely — `role="status"` on web,
 * `accessibilityLiveRegion="polite"` on native, via `politeLiveRegionProps`
 * (`status` is not a valid React Native `accessibilityRole` and crashes
 * Android — spudly/eciperay#156). Message meaning is carried by text,
 * never color alone. The optional dismiss button is labeled "Dismiss" and
 * meets the 44px minimum touch target; its glyph renders at 2xl in the
 * alert's own text color, pulled toward the top-right corner (the
 * treatment carried over from DismissibleBanner, #179/#193).
 */
export function Alert({
  severity = "info",
  message,
  actions,
  dismissible = false,
  onDismiss,
  children,
  ...rest
}: AlertProps) {
  const styles = severityStyles[severity];
  const isAlert = severity === "error" || severity === "warning";
  const showDismiss = dismissible && onDismiss !== undefined;
  const content = children ?? message;
  return (
    <StyledAlert
      backgroundColor={styles.background}
      borderColor={styles.border}
      {...(isAlert
        ? platformAccessibilityProps({ accessibilityRole: "alert" })
        : politeLiveRegionProps)}
      {...rest}
    >
      <XStack justifyContent="space-between" alignItems="flex-start" gap={tokens.spacing[2]}>
        <Text style={{ color: styles.text, flex: 1 }}>{content}</Text>
        {showDismiss ? (
          <Button
            variant="ghost"
            // Shift the 44px target into the corner with relative
            // positioning: the alert's own padding (spacing[3]) plus
            // the glyph centering inside the target otherwise leaves
            // the × floating ~34px from the top-right corner. The
            // offsets are spacing tokens, not raw pixels: up by
            // spacing[6] and right by spacing[5] puts the glyph
            // center ~10px from the corner. Offsets, not margins —
            // spacing belongs to the parent layout; the layout box
            // and the target size are unchanged. (The treatment
            // settled on DismissibleBanner in #193, carried over
            // verbatim so the consolidation keeps it.)
            position="relative"
            top={-tokens.spacing[6]}
            right={-tokens.spacing[5]}
            fontSize={tokens.typography.fontSize["2xl"]}
            // The alert background stays pale in dark mode ($primarySubtle /
            // status step-1 ramps in both modes), so the ghost variant's
            // default $link label — which lightens in dark themes for dark
            // page backgrounds — drops below the 3:1 minimum for control
            // icons against it. The alert's own text color is the
            // contrasting foreground for this background in both modes.
            color={styles.text}
            onPress={onDismiss}
            accessibilityLabel="Dismiss"
            minWidth={44}
            minHeight={44}
          >
            ×
          </Button>
        ) : null}
      </XStack>
      {actions && actions.length > 0 ? (
        <XStack justifyContent="flex-end" gap={tokens.spacing[2]}>
          {actions.map((action) => (
            <Button key={action.label} variant="secondary" onPress={action.onPress}>
              {action.label}
            </Button>
          ))}
        </XStack>
      ) : null}
    </StyledAlert>
  );
}
