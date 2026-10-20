import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { politeLiveRegionProps } from "./accessibility.js";
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

type Severity = keyof typeof severityStyles;

const StyledAlert = styled(XStack, {
  name: "SpudlyInlineAlert",

  borderWidth: 1,
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  gap: tokens.spacing[2],
  alignItems: "flex-start",
});

type StyledAlertProps = GetProps<typeof StyledAlert>;

export interface InlineAlertProps extends StyledAlertProps {
  severity?: Severity;
}

/**
 * Inline message with severity styling. `error` and `warning` announce via
 * `accessibilityRole="alert"` (valid on web and native alike); `info` and
 * `success` announce politely — `role="status"` on web,
 * `accessibilityLiveRegion="polite"` on native, via `politeLiveRegionProps`
 * (`status` is not a valid React Native `accessibilityRole` and crashes
 * Android — spudly/eciperay#156). Message meaning is carried by text,
 * never color alone.
 */
export function InlineAlert({ severity = "info", children, ...rest }: InlineAlertProps) {
  const styles = severityStyles[severity];
  const isAlert = severity === "error" || severity === "warning";
  return (
    <StyledAlert
      backgroundColor={styles.background}
      borderColor={styles.border}
      {...(isAlert ? ({ accessibilityRole: "alert" } as const) : politeLiveRegionProps)}
      {...rest}
    >
      <Text style={{ color: styles.text, flex: 1 }}>{children}</Text>
    </StyledAlert>
  );
}
