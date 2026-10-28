import type { ComponentType } from "react";
import type { AccessibilityState } from "react-native";
import { useTheme } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { Button } from "./Button.js";

export type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = {
  /**
   * The icon to render: one of the design system's semantic icon
   * components from `@spudly/ui/icons` (PrintIcon, ShareIcon, …).
   * IconButton renders it at the size's standard glyph size, inked
   * in the variant's color (or `color`, when given). The glyph is
   * decorative — the button carries the accessible name.
   */
  icon: ComponentType<IconComponentProps>;
  /**
   * The button's accessible name. REQUIRED: an icon button has no
   * visible text, so this label is the only name assistive tech —
   * and tests querying by role + name — can find it by.
   */
  accessibilityLabel: string;
  /** Optional spoken hint describing what the action does. */
  accessibilityHint?: string;
  /**
   * Extra accessibility state (selected for toggle-style icon
   * buttons, expanded for menu triggers, …). The `disabled` entry
   * is managed by the `disabled` prop and overrides anything passed
   * here, so the announced state always matches the real one.
   */
  accessibilityState?: AccessibilityState;
  /**
   * Press callback. An icon button performs an in-place action —
   * per the design system's navigation rule, a control that
   * navigates to another page is a link with an href, not a button,
   * so navigation does not belong here.
   */
  onPress: () => void;
  /** Visual variant, the same four as Button. Default "secondary". */
  variant?: IconButtonVariant;
  /** Standard size (see the geometry table below). Default "md". */
  size?: IconButtonSize;
  /** Disabled: dimmed, not pressable, announced as disabled. */
  disabled?: boolean;
  /** Glyph stroke color override; default is the variant's ink. */
  color?: string;
};

/**
 * Standard geometry (#178): one square box and one glyph size per
 * size, so icon-only actions line up identically wherever hosts use
 * them. Every box clears the 44px touch-target floor the design
 * system already holds (SearchField's clear button); the glyph
 * sizes stay on Feather's proportions under it (24px native at lg).
 */
const sizeGeometry = {
  sm: { box: 44, glyph: 18 },
  md: { box: 48, glyph: 20 },
  lg: { box: 56, glyph: 24 },
} as const;

/**
 * The glyph's ink per variant: the same colors Button gives its
 * text labels, so an icon button and a text button of the same
 * variant read as one family. Resolved to concrete values because
 * react-native-svg cannot resolve Tamagui theme variables — the
 * theme roles (onPrimary, link) are read from the active theme,
 * following the tag-color resolver's pattern (components/tagColors).
 * The fallbacks are the base theme's values for those roles.
 */
function useGlyphInk(variant: IconButtonVariant, override?: string): string {
  const theme = useTheme();
  if (override !== undefined) {
    return override;
  }
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  switch (variant) {
    case "primary":
      return roleValue("onPrimary") ?? "#ffffff";
    case "ghost":
      return roleValue("link") ?? tokens.colors.primary.primary8;
    case "danger":
      return "#ffffff";
    case "secondary":
      return tokens.colors.gray.gray10;
  }
}

/**
 * Icon-only button (#178, Stephen's call to add it rather than keep
 * composing): the standardized replacement for hosts hand-rolling
 * `Button` + an icon child, each with its own sizing, padding, and
 * labeling habits (RecipeDetailPage's print/share chips were the
 * shape that proved the need). IconButton fixes the three things
 * that varied: square geometry and touch target per size, the glyph
 * inked in the variant's label color for the active theme, and a
 * REQUIRED `accessibilityLabel` — there is no visible text, so an
 * unlabeled icon button would be an unnamed control.
 *
 * Rendering goes through the design system's `Button`, so variant
 * fills, the disabled dim, the button role, and the web ARIA
 * translation of the accessibility props (#235) are inherited, not
 * re-implemented; IconButton zeroes Button's text padding and pins
 * the square box (flexShrink 0, so a tight row cannot compress the
 * standard target).
 */
export function IconButton({
  icon: Glyph,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  onPress,
  variant = "secondary",
  size = "md",
  disabled = false,
  color,
}: IconButtonProps) {
  const { box, glyph } = sizeGeometry[size];
  const ink = useGlyphInk(variant, color);
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled }}
      width={box}
      height={box}
      flexShrink={0}
      paddingHorizontal={0}
      paddingVertical={0}
      alignItems="center"
      justifyContent="center"
    >
      <Glyph size={glyph} color={ink} />
    </Button>
  );
}
