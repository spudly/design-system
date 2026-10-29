import { Children, forwardRef } from "react";
import type { ComponentType, ReactNode } from "react";
import { Anchor, Button as TamaguiButton, styled, useTheme } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The button frame's styling: ONE config shared by the two frames
 * Button renders, so the forms are pixel-identical and cannot drift:
 *
 * - `StyledButton` (the button form): a Tamagui Button — renders a
 *   `<button>` element on web and a pressable on native; activation
 *   is the caller's `onPress` callback.
 * - `StyledLinkButton` (the href form, #248): a Tamagui Anchor with
 *   the same frame — renders a real `<a href>` on web; on native a
 *   press opens the href through the platform link path (Tamagui's
 *   Anchor calls Linking.openURL internally, so no DS component
 *   imports react-native — the root module graph must stay loadable
 *   in plain Node).
 */
const buttonFrameConfig = {
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
  } as const,
};

const StyledButton = styled(TamaguiButton, {
  name: "Button",
  ...buttonFrameConfig,
});

const StyledLinkButton = styled(Anchor, {
  name: "ButtonLink",
  ...buttonFrameConfig,

  // An anchor is a text element, not a flex frame: center the label
  // so a stretched link (a full-width CTA row) centers its label the
  // way the button form centers its content.
  textAlign: "center",
});

type StyledButtonProps = GetProps<typeof StyledButton>;

/**
 * Button's own props, minus the entries the wrapper manages or gives
 * a design-system meaning: `disabled` (mirrored into the
 * accessibility state), `children` (the label — declared per
 * ButtonProps shape below), Tamagui Button's own `icon` prop
 * (a rendered node/callback in Tamagui's API; the design system's
 * icon slot takes an icon COMPONENT instead, declared here), and
 * `href` (the activation discriminant — declared per ButtonProps
 * shape below, and destructured by the wrapper so it can never leak
 * onto the rendered button element as a stray attribute).
 */
type ButtonOwnProps = Omit<StyledButtonProps, "disabled" | "children" | "icon" | "href"> & {
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

/** The button form's label/icon shapes (activation by callback). */
type ButtonIconShapes =
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
    };

type StyledLinkButtonProps = GetProps<typeof StyledLinkButton>;

/**
 * The href (link) form's props: the Anchor frame's props, minus the
 * entries the wrapper manages (`disabled`, `children`) and the
 * button-form-only entries (`icon`, `onPress` — a link navigates;
 * it does not take a press callback).
 */
type ButtonLinkProps = Omit<StyledLinkButtonProps, "disabled" | "children" | "icon" | "onPress"> & {
  disabled?: boolean;
  /**
   * The link's destination. Giving Button an `href` makes it a
   * LINK (#248's navigation rule: a control that navigates to
   * another page is a link with an href; anything else is a button
   * element with a callback): on web it renders a real anchor
   * carrying the href, and on native a press opens the href through
   * the platform link path. The frame, variants, and sizes are the
   * button form's own — only the element and the activation differ.
   * Native contract (shared by every DS href form): the href is
   * forwarded verbatim to `Linking.openURL`, which requires a
   * scheme-bearing URL an installed app can open — so on native
   * the host passes an absolute URL (the app's deep-link scheme
   * or an https URL); root-relative paths such as "/recipes" are
   * web-form destinations. The design system has no base URL or
   * router to resolve a relative path against, so composing the
   * per-platform destination is the host's part of the contract
   * (the host composes hrefs from its routes, #248).
   */
  href: string;
  /** A link navigates — press callbacks belong to the button form. */
  onPress?: never;
  /**
   * The icon slot belongs to the button form: an anchor's content
   * is its label text (a navigating control that needs richer
   * content is a card/row link, not a Button).
   */
  icon?: never;
  /** The label text. A labeled link is named by its text. */
  children?: ReactNode;
  accessibilityLabel?: string;
};

export type ButtonProps =
  (ButtonOwnProps & { href?: undefined } & ButtonIconShapes) | ButtonLinkProps;

/**
 * The widened field set the wrapper renders from. The public
 * `ButtonProps` union keeps the two activation forms mutually
 * exclusive at call sites; the members agree on every shared
 * field's type, so rendering reads them through this one shape.
 */
type ButtonRenderProps = ButtonOwnProps & {
  href?: string;
  icon?: ComponentType<IconComponentProps>;
  children?: ReactNode;
  accessibilityLabel?: string;
};

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
 *
 * Two activation forms (#248's navigation rule — a control that
 * navigates to another page is a link with an href; anything else is
 * a button element with a callback):
 *
 * - Button form (default): pass `onPress`; renders a `<button>`
 *   element on web, a pressable on native.
 * - Link form: pass `href` (and no `onPress`, no `icon`); renders a
 *   real `<a href>` on web with the identical frame, variants, and
 *   sizes, and on native a press opens the href through the platform
 *   link path. While `disabled`, the link renders WITHOUT its href
 *   (the ARIA disabled-link pattern): it stays visible and announced
 *   as disabled but cannot be followed on either platform.
 *
 * Icon slot: pass a DS icon component as `icon` and it renders to
 * the left of the label, in the variant's label color; pass no label
 * and the button is icon-only — a square target (44/48/56px) that
 * then requires `accessibilityLabel` (see ButtonProps). Button owns
 * all of the slot's styling; there are no icon styling props.
 * Accessibility: exposes `accessibilityRole="button"` ("link" in the
 * href form) and mirrors `disabled` into `accessibilityState`. Caller accessibility props
 * (`accessibilityLabel`, `accessibilityState`, …) go through
 * `platformAccessibilityProps` (#235): Tamagui's web renderer forwards
 * them to the DOM verbatim (`accessibilitylabel="…"`,
 * `accessibilitystate="[object Object]"`, no accessible name), so on
 * web they are translated to their ARIA equivalents (`aria-label`,
 * `aria-disabled`, …) and the RN-only props are dropped; on native
 * they pass through unchanged. A caller-passed ARIA prop in `rest`
 * still wins over the translated one.
 */
export const Button = forwardRef<TamaguiElement, ButtonProps>(function Button(
  props: ButtonProps,
  ref,
) {
  const {
    disabled = false,
    variant = "primary",
    size = "md",
    icon: IconGlyph,
    children,
    color,
    href,
    onPress,
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
  } = props as ButtonRenderProps;
  // `variant`'s prop type also admits Tamagui Button's built-in variant
  // names; only the four design-system variants have a mapped label color.
  const labelColor = color ?? variantLabelColors[variant as keyof typeof variantLabelColors];
  const glyphInk = useGlyphInk(typeof variant === "string" ? variant : undefined);
  const isLink = href !== undefined;
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? (isLink ? "link" : "button"),
    accessibilityState: { disabled, ...accessibilityState },
    accessibilityValue,
  });
  if (isLink) {
    return (
      <StyledLinkButton
        ref={ref}
        {...a11yProps}
        // A disabled link is not followable: the href is withheld
        // entirely (ARIA's disabled-link pattern — the attribute is
        // absent, not empty) while the disabled state above still
        // announces it. On native the Anchor opens the href only
        // when one is present, so the press is inert too.
        {...(disabled ? {} : { href })}
        disabled={disabled}
        variant={variant}
        size={size}
        color={labelColor}
        // Same instance-prop rule as the button form's `color`: the
        // BARE font name ("body", no "$") is the form that makes
        // Tamagui emit the font-context class defining `--f-family`
        // (see Text, #69). A caller-passed `fontFamily` in `rest`
        // still wins.
        fontFamily="body"
        // `rest` is read through the widened render shape (its
        // fields are the button frame's); call sites are typed by
        // ButtonLinkProps, so what actually arrives is the link
        // frame's own props — the cast states that for the spread.
        {...(rest as Omit<
          StyledLinkButtonProps,
          "href" | "disabled" | "children" | "variant" | "size" | "color" | "fontFamily"
        >)}
      >
        {children}
      </StyledLinkButton>
    );
  }
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
      ref={ref}
      {...a11yProps}
      onPress={onPress}
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
});
