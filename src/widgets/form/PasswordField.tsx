import { useState } from "react";
import { XStack, isWeb } from "tamagui";
import { EyeIcon } from "../../icons/EyeIcon.js";
import { EyeOffIcon } from "../../icons/EyeOffIcon.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { TextField, type TextFieldProps } from "./TextField.js";

export type PasswordFieldProps = Omit<TextFieldProps, "secureTextEntry" | "type" | "trailing"> & {
  /** Accessible name of the toggle while the password is concealed
   * (the action it performs: show the password). Required — the DS
   * ships no default strings (#539); the auth forms supply it from
   * their voice slots (#758). */
  showPasswordLabel: string;
  /** Accessible name of the toggle while the password is revealed
   * (the action it performs: hide the password). Required, like
   * `showPasswordLabel`. */
  hidePasswordLabel: string;
  /** Start revealed instead of concealed. The toggle state is
   * internal either way; this only seeds it (the stories and tests
   * render the revealed state through it). */
  defaultRevealed?: boolean;
};

/**
 * Password input with an in-field show/hide eye toggle (#758): a
 * separate widget composing TextField — TextField itself carries no
 * toggle logic (Stephen's 2026-11-21 direction).
 *
 * The field renders through TextField with `secureTextEntry` while
 * concealed, so the existing per-platform masking translation
 * applies (web: `type="password"`; native: the RN prop, #262), and
 * without it while revealed. Toggling only flips that masking: the
 * controlled value, the label, and every other field prop pass
 * through untouched, so the typed password is never cleared or
 * re-typed.
 *
 * The toggle follows SearchField's clear-button pattern: an XStack
 * pressable inside the field, named through
 * platformAccessibilityProps with the button role, a 44px minimum
 * target, and the pressed state announced (`aria-pressed` on web,
 * `accessibilityState.selected` on native, the Button toggle
 * precedent). Its accessible name is the action for the CURRENT
 * state — `showPasswordLabel` while concealed, `hidePasswordLabel`
 * while revealed — and the glyph matches: eye while concealed,
 * eye-off while revealed. The toggle sits after the input in focus
 * order (it renders after it, absolutely positioned over the
 * field's right edge through TextField's `trailing` slot, which
 * anchors it to the input row alone — the toggle stretches the
 * input's full height and centers its glyph on that height, so it
 * is vertically centered on the input in EVERY state: the label
 * line above and the error line below live outside the anchor and
 * can never pull it off center, and no label-height arithmetic is
 * involved), and the input reserves right padding so the value
 * never runs under it.
 * A disabled field's toggle drops its press handler and reports
 * the disabled state, like SearchField's clear button.
 */
export function PasswordField({
  showPasswordLabel,
  hidePasswordLabel,
  defaultRevealed = false,
  disabled = false,
  label,
  ...rest
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const toggleLabel = revealed ? hidePasswordLabel : showPasswordLabel;
  const toggle = (
    <XStack
      onPress={disabled ? undefined : () => setRevealed((value) => !value)}
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel: toggleLabel,
        ...(isWeb ? {} : { accessibilityState: { disabled, selected: revealed } }),
      })}
      {...(isWeb ? { "aria-pressed": revealed } : {})}
      position="absolute"
      right={0}
      top={0}
      bottom={0}
      alignItems="center"
      justifyContent="center"
      minWidth={44}
      minHeight={44}
    >
      {revealed ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
    </XStack>
  );
  return (
    <TextField
      {...rest}
      {...(label ? { label } : {})}
      disabled={disabled}
      {...(revealed ? {} : { secureTextEntry: true })}
      paddingRight={tokens.spacing[12]}
      trailing={toggle}
    />
  );
}
