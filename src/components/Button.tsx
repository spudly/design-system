import { Children } from "react";
import type { ComponentType, ReactNode } from "react";
import { Button as TamaguiButton, styled, useTheme } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { platformAccessibilityProps } from "./accessibility.js";

const StyledButton = styled(TamaguiButton, {
  name: "Button",

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

/**
 * Button's own props, minus the entries the wrapper manages or gives
 * a design-system meaning: `disabled` (mirrored into the
 * accessibility state), `children` (the label — declared per
 * ButtonProps shape below), and Tamagui Button's own `icon` prop
 * (a rendered node/callback in Tamagui's API; the design system's
 * icon slot takes an icon COMPONENT instead, declared here).
 */
type ButtonOwnProps = Omit<StyledButtonProps, "disabled" | "children" | "icon"> & {
  disabled?: boolean;
  /**
   * The icon slot: one of the design system's semantic icon
   * components from `@spudly/ui/icons` (PrintIcon, ShareIcon, …).
   * This is CONTENT, not styling — Button renders the glyph itself,
   * at the size's standard glyph size (18/20/24px for sm/md/lg),
   * inked in the variant's label color resolved from the active
   * theme, to the LEFT of the label; with no label it is the
   * button's only content. There is deliberately no icon color,
   * size, or style prop: Button owns its styling completely, the
   * same rule that keeps styling props off every DS component.
   * The glyph is decorative — the button carries the accessible
   * name (the label text, or `accessibilityLabel` when icon-only).
   */
  icon?: ComponentType<IconComponentProps>;
};

export type ButtonProps = ButtonOwnProps &
  (
    | {
        /** No icon: the plain labeled button, unchanged. */
        icon?: undefined;
        /** The label text. A labeled button is named by its text. */
        children?: ReactNode;
        accessibilityLabel?: string;
      }
    | {
        /**
         * Icon + label: the glyph renders left of the label text.
         * Boolean children are excluded — `false` renders no label,
         * so it belongs to the icon-only shape below, where the
         * label requirement lives.
         */
        icon: ComponentType<IconComponentProps>;
        children: Exclude<NonNullable<ReactNode>, boolean>;
        accessibilityLabel?: string;
      }
    | {
        /**
         * Icon-only: no label text (no children, or only
         * boolean/null children, which render nothing), so
         * `accessibilityLabel` is REQUIRED — it is the only name
         * assistive tech (and tests querying by role + name) can
         * find the button by.
         */
        icon: ComponentType<IconComponentProps>;
        children?: boolean | null;
        accessibilityLabel: string;
      }
  );

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

/** Standard glyph size per Button size, for the icon slot. */
const glyphSizes = {
  sm: 18,
  md: 20,
  lg: 24,
} as const;

/**
 * The icon-only touch target per Button size: one square box, so
 * icon-only actions line up identically wherever hosts use them.
 * Every box clears the 44px touch-target floor the design system
 * already holds (SearchField's clear button).
 */
const iconOnlyBoxes = {
  sm: 44,
  md: 48,
  lg: 56,
} as const;

/**
 * The icon glyph's ink for a variant: the same colors
 * `variantLabelColors` gives the text label, resolved to concrete
 * values because react-native-svg cannot resolve Tamagui theme
 * variables — the theme roles (onPrimary, link) are read from the
 * active theme, following the tag-color resolver's pattern
 * (components/tagColors). The fallbacks are the base theme's values
 * for those roles.
 */
function useGlyphInk(variant: string | undefined): string {
  const theme = useTheme();
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  switch (variant) {
    case "secondary":
      return tokens.colors.gray.gray10;
    case "ghost":
      return roleValue("link") ?? tokens.colors.primary.primary8;
    case "danger":
      return "#ffffff";
    case "primary":
    default:
      return roleValue("onPrimary") ?? "#ffffff";
  }
}

/**
 * Universal cross-platform button (web + React Native via Tamagui).
 *
 * Props: `variant` ("primary" | "secondary" | "ghost" | "danger"), `size`
 * ("sm" | "md" | "lg"), `disabled`. All styling is token-driven. Use
 * `danger` for destructive actions (delete, revoke, remove).
 * Icon slot: pass a DS icon component as `icon` and it renders to
 * the left of the label, in the variant's label color; pass no label
 * and the button is icon-only — a square target (44/48/56px) that
 * then requires `accessibilityLabel` (see ButtonProps). Button owns
 * all of the slot's styling; there are no icon styling props.
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
  size = "md",
  icon: IconGlyph,
  children,
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
  const glyphInk = useGlyphInk(typeof variant === "string" ? variant : undefined);
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
  // Renderable-label detection: Children.toArray drops the child
  // forms that render nothing (null, undefined, booleans); an empty
  // string is dropped by the some() check. Anything left — text, a
  // number, an element — is a real label. With an icon and no
  // renderable label, the button is icon-only.
  const hasLabel = Children.toArray(children).some((child) => child !== "");
  const iconOnly = IconGlyph != null && !hasLabel;
  const glyphSize = glyphSizes[size as keyof typeof glyphSizes] ?? glyphSizes.md;
  const iconOnlyBox = iconOnlyBoxes[size as keyof typeof iconOnlyBoxes] ?? iconOnlyBoxes.md;
  return (
    <StyledButton
      {...a11yProps}
      disabled={disabled}
      variant={variant}
      size={size}
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
      // The icon slot's layout is Button's own styling: a fixed gap
      // between glyph and label, and — icon-only — the size's text
      // padding zeroed with the square standard box pinned
      // (flexShrink 0, so a tight row cannot compress the target).
      // Instance props on Button's own styled frame, not caller
      // styling; a caller-passed value in `rest` still wins.
      {...(IconGlyph ? { gap: tokens.spacing[2] } : null)}
      {...(iconOnly
        ? {
            width: iconOnlyBox,
            height: iconOnlyBox,
            flexShrink: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            alignItems: "center",
            justifyContent: "center",
          }
        : null)}
      {...rest}
    >
      {IconGlyph ? <IconGlyph size={glyphSize} color={glyphInk} /> : null}
      {children}
    </StyledButton>
  );
}
