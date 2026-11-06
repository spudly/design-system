import type { ReactNode } from "react";
import { Text } from "./Text.js";
import type { TextProps } from "./Text.js";

export type TextActionProps = Omit<TextProps, "onPress"> & {
  /** Press handler — a text action always triggers an action. */
  onPress: () => void;
  /**
   * Disabled actions are not pressable, are removed from the web tab
   * order, and report `disabled` through `accessibilityState`.
   * Visual dimming stays the caller's choice (e.g. an `opacity`
   * prop), so existing treatments render unchanged.
   */
  disabled?: boolean;
  children: ReactNode;
};

/**
 * The shared design-system pattern for a small text-style press
 * action (#229): a piece of text that acts as a button — a comment's
 * Edit / Save / Cancel / Delete, a list row's Delete, and similar
 * inline actions. Use this instead of a `Text`/`XStack` carrying
 * `accessibilityRole="button"` and `onPress` inline, and instead of
 * a chrome-bearing `Button` when the design calls for bare text
 * (Button stays the choice when the action should look like a
 * button).
 *
 * Rendering the action as text keeps its appearance identical to
 * the DS `Text` it replaces — all text styling (variant, color,
 * fontSize, fontWeight, opacity) passes through as Text props.
 *
 * Accessibility: exposes `accessibilityRole="button"` and mirrors
 * `disabled` into `accessibilityState`. On web the role alone is
 * not keyboard-operable, so the action is made focusable
 * (`tabIndex={0}`) and the button activation keys — Enter and
 * Space — invoke the same callback as a press, following the
 * pattern already established by TextLink, BackLink, and the
 * pressable row blocks (MealPlansPage, RecipeFormPage). `tabIndex`
 * and `onKeyDown` are web-only props in Tamagui and are ignored on
 * native, where `onPress` is the activation path. A caller's own
 * `tabIndex`/`onKeyDown` (via the remaining Text props) overrides
 * these defaults.
 */
export function TextAction({ onPress, disabled = false, children, ...rest }: TextActionProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };
  const handleKeyDown = (event: { key: string; repeat?: boolean; preventDefault: () => void }) => {
    if (!disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      // A held key repeats keydown events; a native button does not
      // re-activate on repeats, so only the first event presses.
      if (!event.repeat) {
        onPress();
      }
    }
  };
  return (
    <Text
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={handlePress}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
      {...rest}
    >
      {children}
    </Text>
  );
}
