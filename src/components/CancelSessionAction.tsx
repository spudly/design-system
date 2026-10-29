import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { TextAction } from "./TextAction.js";

export type CancelSessionActionProps = {
  /** Ends the session. Never fires while `disabled`. */
  onPress: () => void;
  /**
   * A request is in flight: the action dims, leaves the tab
   * order, and refuses activation — pointer, keyboard, and
   * assistive-technology clicks alike (TextAction's disabled
   * semantics, with the dimming this treatment adds).
   */
  disabled?: boolean;
  /** The visible label, and the accessible name. */
  label?: string;
};

/**
 * The quiet exit at the foot of a session screen: an
 * underlined muted text action that abandons the session.
 * Deliberately not a Button — leaving is not one of the
 * session's working actions, so it renders as bare text
 * (TextAction's button role and keyboard support) in the
 * muted underlined treatment, dimmed while a request is in
 * flight. Extracted for the #119 page de-styling program
 * from the AI session page, which hand-built this control
 * with a pressable stack and its own keyboard handler.
 */
export function CancelSessionAction({
  onPress,
  disabled = false,
  label = "Cancel session",
}: CancelSessionActionProps) {
  return (
    <YStack opacity={disabled ? 0.5 : 1} pointerEvents={disabled ? "none" : "auto"}>
      <TextAction
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
        fontSize={tokens.typography.fontSize.sm}
        color={tokens.colors.gray.gray6}
        textDecorationLine="underline"
      >
        {label}
      </TextAction>
    </YStack>
  );
}
