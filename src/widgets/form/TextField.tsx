import type { ReactNode } from "react";
import { Input as TamaguiInput, View, isWeb, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { FieldShell } from "./FieldShell.js";
import { useFieldA11y } from "../../views/useFieldA11y.js";
import { Text } from "../data/Text.js";

const StyledInput = styled(TamaguiInput, {
  name: "TextField",

  backgroundColor: "$surface",
  borderWidth: 1,
  // Input boundaries are functional, not decorative: WCAG 1.4.11 asks
  // ≥3:1 against adjacent colors. $borderColor falls to 1.2:1 in light
  // mode and 1.9–2.3:1 in dark, so field borders use $textMuted, which
  // holds ≥4.5:1 against both the page background and the $surface fill
  // in every brand and mode.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
  minHeight: 44,
  fontSize: tokens.typography.fontSize.md,
  color: "$color",

  variants: {
    error: {
      true: {
        borderColor: "$danger",
      },
    },
    // A field whose value differs from the version it was derived
    // from (the recipe form's parent-version diff): the warning wash
    // REPLACES the $surface fill outright — warning step 5 border,
    // step 1 fill — so the two fills never combine. Semantic prop, so
    // pages pass `changed` instead of styling the field themselves
    // (#119).
    changed: {
      true: {
        borderColor: tokens.colors.warning.warning5,
        backgroundColor: tokens.colors.warning.warning1,
      },
    },
  } as const,
});

type StyledInputProps = GetProps<typeof StyledInput>;

export type TextFieldProps = StyledInputProps & {
  label?: string;
  error?: string;
  id?: string;
  /**
   * When true, the field takes the flex row's remaining width
   * (its root carries flex: 1) — the FieldRow pattern, mirroring
   * SearchField's `grow`: a field in a row of fields grows,
   * so the row's other children keep their natural widths.
   * The input itself also fills the root's height on the grow
   * path, so in a FieldRow (stretch alignment, one common
   * height) the field's box matches its button exactly (#476).
   */
  grow?: boolean;
  /**
   * Optional node rendered inside a relatively-positioned wrapper
   * around the input ALONE (not the label or error line), so an
   * absolutely-positioned trailing control anchors to the input row
   * itself and stays centered on it in every state — with or without
   * a label, with or without an error (PasswordField's eye toggle,
   * #758). The wrapper carries the grow flex instead of the input
   * when both are set.
   */
  trailing?: ReactNode;
};

/**
 * Labeled text input with error-state support. Associates the label via
 * `htmlFor`, wires error text through `aria-describedby`/`aria-invalid`,
 * and enforces a 44px minimum touch target. Pass `secureTextEntry` for
 * password fields. `autoComplete` accepts React Native's values; the
 * password tokens are translated to the HTML tokens on web (#321).
 * Placeholders default to the theme's `$textMuted` color so they stay
 * visible on native (eciperay#334); a caller-supplied
 * `placeholderTextColor` wins over the default. On `changed` fields
 * the fill is the warning ramp's step-1 wash in every theme, against
 * which the dark theme's `$textMuted` fails contrast, so the default
 * there is the ramp's step-10 dark step instead.
 */
/**
 * The auth forms pass React Native's Android-vocabulary autocomplete
 * hints (`password`, `password-new`), which the HTML `autocomplete`
 * attribute does not define — web password managers ignore them.
 * The valid web tokens are `current-password` / `new-password`
 * (#321). Native needs no translation: React Native 0.88's TextInput
 * accepts the native values as-is (and itself maps `new-password`
 * to `password-new` for Android internally), so only the two
 * password tokens are rewritten, and only on web; every other
 * value (`email`, `username`, `off`, …) passes through unchanged
 * on both platforms.
 */
const webAutoCompleteByNativeAutoComplete: Record<string, string> = {
  password: "current-password",
  "password-new": "new-password",
};

export function TextField({
  label,
  error,
  grow = false,
  trailing,
  id: idProp,
  secureTextEntry,
  type,
  changed,
  placeholderTextColor,
  autoComplete,
  onSubmitEditing,
  onCompositionStart,
  onCompositionEnd,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: TextFieldProps) {
  const { a11yProps, id, errorId } = useFieldA11y(
    {
      accessible,
      accessibilityElementsHidden,
      accessibilityHint,
      accessibilityLabel,
      accessibilityLabelledBy,
      accessibilityLiveRegion,
      accessibilityRole,
      accessibilityState,
      accessibilityValue,
    },
    idProp,
  );
  // `secureTextEntry` is a React Native prop; Tamagui's web Input
  // destructures it out and discards it, so a password field rendered
  // as a plain text input and showed the password as typed (#262,
  // found on Eciperay web as spudly/eciperay#292). Translate it per
  // platform, the same way the accessibility props above are
  // translated: on web it becomes `type="password"` (a caller-supplied
  // `type` wins) and the RN prop is not forwarded; on native
  // `secureTextEntry` passes through unchanged and a caller-supplied
  // `type` is forwarded alongside it — Tamagui's native Input
  // translates `type="password"` to `secureTextEntry` when the RN
  // prop itself is unset, so dropping `type` there would silently
  // unmask a field the caller marked as a password field.
  const secureProps = Object.fromEntries(
    Object.entries(
      isWeb
        ? { type: type ?? (secureTextEntry ? "password" : undefined) }
        : { secureTextEntry, type },
    ).filter(([, value]) => value !== undefined),
  ) as Pick<StyledInputProps, "type" | "secureTextEntry">;

  // `autoComplete` is destructured out of the rest props and
  // re-emitted per platform (#321, see the map above): on web the
  // two RN password tokens become the HTML tokens; on native the
  // caller's value passes through unchanged.
  const autoCompleteProps = Object.fromEntries(
    Object.entries({
      autoComplete: isWeb
        ? (webAutoCompleteByNativeAutoComplete[autoComplete ?? ""] ?? autoComplete)
        : autoComplete,
    }).filter(([, value]) => value !== undefined),
  ) as Pick<StyledInputProps, "autoComplete">;

  return (
    <FieldShell
      label={label}
      id={id}
      grow={grow}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onSubmitEditing={onSubmitEditing}
    >
      {({ submitEditingProps, compositionProps }) => (
        <>
          <View position="relative" {...(grow ? { flex: 1 } : {})}>
            <StyledInput
              id={id}
              error={!!error}
              changed={changed ?? false}
              placeholderTextColor={
                placeholderTextColor ?? (changed ? tokens.colors.warning.warning10 : "$textMuted")
              }
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              {...a11yProps}
              {...rest}
              {...(grow ? { flex: 1 } : {})}
              {...secureProps}
              {...autoCompleteProps}
              {...submitEditingProps}
              {...compositionProps}
            />
            {trailing ?? null}
          </View>
          {error ? (
            <Text variant="error" id={errorId}>
              {error}
            </Text>
          ) : null}
        </>
      )}
    </FieldShell>
  );
}
