import { Button as TamaguiButton, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

const StyledButton = styled(TamaguiButton, {
  name: "SpudlyButton",

  // Base: theme-aware styling — uses $primary/$onPrimary from the active
  // Tamagui theme (e.g. terracotta for Eciperay Warm Harvest), not the raw
  // brand-neutral primary ramp.
  backgroundColor: "$primary",
  borderRadius: tokens.radii.md,
  borderWidth: 0,
  color: "$onPrimary",
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.semibold,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[3],

  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "$onPrimary",
      },
      secondary: {
        backgroundColor: tokens.colors.gray.gray3,
        color: tokens.colors.gray.gray10,
      },
      ghost: {
        // Text-only by design: no fill and no border at rest. (An earlier
        // revision added a subtle fill plus border for visibility, but
        // ghost means chrome-less — the fill made it read as a secondary
        // button.) Readability comes from the label color, which the
        // Button wrapper below sets per variant — a variant-level `color`
        // does not reach Tamagui Button's internal text element.
        backgroundColor: "transparent",
        borderWidth: 0,
      },
      danger: {
        // Danger ramp step 7 (not the $danger role at step 6) so white
        // label text keeps WCAG AA contrast on the filled background —
        // same value the apps' destructive buttons already render.
        backgroundColor: tokens.colors.danger.danger7,
        color: "#ffffff",
      },
    },
    size: {
      sm: {
        fontSize: tokens.typography.fontSize.sm,
        paddingHorizontal: tokens.spacing[3],
        paddingVertical: tokens.spacing[2],
      },
      md: {
        fontSize: tokens.typography.fontSize.md,
        paddingHorizontal: tokens.spacing[4],
        paddingVertical: tokens.spacing[3],
      },
      lg: {
        fontSize: tokens.typography.fontSize.lg,
        paddingHorizontal: tokens.spacing[6],
        paddingVertical: tokens.spacing[4],
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type StyledButtonProps = GetProps<typeof StyledButton>;

export interface ButtonProps extends Omit<StyledButtonProps, "disabled"> {
  disabled?: boolean;
}

/**
 * Label colors per variant. These must be passed as an instance `color`
 * prop: Tamagui Button forwards its base/instance `color` to the internal
 * text element, but a `styled()` variant's `color` only styles the frame —
 * so the ghost variant rendered its label in the base `$onPrimary` (white)
 * on a transparent background, and the secondary variant rendered white on
 * light gray. Both were effectively invisible.
 */
const variantLabelColors = {
  primary: "$onPrimary",
  secondary: tokens.colors.gray.gray10,
  // $link is the dark-aware text role: a dark step on light surfaces and
  // the lightened step in dark themes, so the text-only ghost label keeps
  // AA contrast in both modes (the base $onPrimary white was invisible on
  // light backgrounds — the original defect).
  ghost: "$link",
  danger: "#ffffff",
} as const;

/**
 * Universal cross-platform button (web + React Native via Tamagui).
 *
 * Props: `variant` ("primary" | "secondary" | "ghost" | "danger"), `size`
 * ("sm" | "md" | "lg"), `disabled`. All styling is token-driven. Use
 * `danger` for destructive actions (delete, revoke, remove).
 * Accessibility: exposes `accessibilityRole="button"` and mirrors `disabled`
 * into `accessibilityState`. Caller accessibility props
 * (`accessibilityLabel`, `accessibilityState`, …) go through
 * `platformAccessibilityProps` (#235): Tamagui's web renderer forwards
 * them to the DOM verbatim (`accessibilitylabel="…"`,
 * `accessibilitystate="[object Object]"`, no accessible name), so on
 * web they are translated to their ARIA equivalents (`aria-label`,
 * `aria-disabled`, …) and the RN-only props are dropped; on native
 * they pass through unchanged. A caller-passed ARIA prop in `rest`
 * still wins over the translated one.
 */
export function Button({
  disabled = false,
  variant = "primary",
  color,
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
}: ButtonProps) {
  // `variant`'s prop type also admits Tamagui Button's built-in variant
  // names; only the four design-system variants have a mapped label color.
  const labelColor = color ?? variantLabelColors[variant as keyof typeof variantLabelColors];
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? "button",
    accessibilityState: { disabled, ...accessibilityState },
    accessibilityValue,
  });
  return (
    <StyledButton
      {...a11yProps}
      disabled={disabled}
      variant={variant}
      color={labelColor}
      // Same instance-prop rule as `color` above, for the family:
      // Tamagui Button forwards an instance `fontFamily` to its
      // internal text element, and the BARE font name ("body", no
      // "$") is the form that makes Tamagui emit the font-context
      // class defining `--f-family` (see Text, #69); a styled()-only
      // or "$body" family left the label inheriting the page's
      // default family while fonted primitives (Input, Label)
      // rendered in the theme stack. A caller-passed `fontFamily`
      // in `rest` still wins.
      fontFamily="body"
      {...rest}
    />
  );
}
