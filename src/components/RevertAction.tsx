import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type RevertActionProps = {
  /** The pre-formatted parent value, rendered after "Revert
   * to: " (the host formats parent values its own way). */
  label: string;
  onPress: () => void;
};

/**
 * The version-diff revert affordance (#119, extracted from
 * RecipeFormPage): small warning-tone text, pressable — the
 * app's RevertButton treatment for a field or list whose value
 * differs from the version it was derived from. Web keyboard
 * support follows the MealPlansPage row pattern — Enter and
 * Space invoke the same callback as a press — and the button
 * role routes through platformAccessibilityProps (#237), so on
 * web it renders as a real button role, never a leaked RN prop.
 */
export function RevertAction({ label, onPress }: RevertActionProps) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <YStack
      {...platformAccessibilityProps({ accessibilityRole: "button" })}
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
    >
      <Text
        fontSize={tokens.typography.fontSize.xs}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.warning.warning9}
        opacity={0.8}
      >
        {`Revert to: ${label}`}
      </Text>
    </YStack>
  );
}
