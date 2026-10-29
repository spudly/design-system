import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type StatusMessageProps = {
  /** The status line's text. */
  children: string;
};

/**
 * A centered status line (#119): the quiet confirmation a page
 * shows under an action row once an action lands ("Version
 * activated", "Changes saved") — small muted text, centered on
 * the content column, exposed as a text element for assistive
 * technology. The treatment is the component's own; pages pass
 * only the message.
 */
export function StatusMessage({ children }: StatusMessageProps) {
  return (
    <Text
      accessibilityRole="text"
      textAlign="center"
      fontSize={tokens.typography.fontSize.sm}
      color={tokens.colors.gray.gray7}
    >
      {children}
    </Text>
  );
}
