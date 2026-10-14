import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
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
 * `role="alert"`; `info` and `success` use the quieter `role="status"`.
 * Message meaning is carried by text, never color alone.
 */
export function InlineAlert({ severity = "info", children, ...rest }: InlineAlertProps) {
  const styles = severityStyles[severity];
  const role = severity === "error" || severity === "warning" ? "alert" : "status";
  return (
    <StyledAlert
      backgroundColor={styles.background}
      borderColor={styles.border}
      accessibilityRole={role}
      {...rest}
    >
      <Text style={{ color: styles.text, flex: 1 }}>{children}</Text>
    </StyledAlert>
  );
}
