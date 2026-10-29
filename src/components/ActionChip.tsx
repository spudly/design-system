import type { ComponentType } from "react";
import { Anchor, Button as TamaguiButton, Text as TamaguiText, styled, useTheme } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The chip frame: Button's geometry at the small end of its scale,
 * with the fill/border owned by the `tone` variant. ONE config
 * shared by the two frames the chip renders (the press form's
 * Tamagui Button and the href form's Anchor — Button's
 * buttonFrameConfig pattern), so the forms are pixel-identical
 * and cannot drift. The label ink is NOT set here — a styled()
 * variant's `color` styles only the frame, not Tamagui Button's
 * internal text element (the lesson Button's variantLabelColors
 * records), so the wrapper passes the tone's ink as an instance
 * `color` prop at render.
 */
const chipFrameConfig = {
  borderRadius: tokens.radii.md,
  borderWidth: 0,
  fontWeight: tokens.typography.fontWeight.semibold,

  variants: {
    tone: {
      neutral: {
        backgroundColor: tokens.colors.gray.gray2,
      },
      danger: {
        backgroundColor: tokens.colors.danger.danger1,
      },
      success: {
        backgroundColor: tokens.colors.success.success2,
      },
      primary: {
        backgroundColor: "$primarySubtle",
        borderWidth: 1,
        borderColor: "$primary",
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$borderColor",
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
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    tone: "neutral",
    size: "sm",
  } as const,
};

const StyledChip = styled(TamaguiButton, {
  name: "ActionChip",
  ...chipFrameConfig,
});

const StyledLinkChip = styled(Anchor, {
  name: "ActionChipLink",
  ...chipFrameConfig,

  // An anchor is a text element, not a flex frame: on web it is
  // `display: inline` by default, which would collapse the chip's
  // frame — so web gets a real flex frame, centering the label
  // the way the press form centers its content (Button's
  // StyledLinkButton lesson). A web anchor also carries the UA
  // link underline; the press form has none, and the two forms
  // are contracted to look identical.
  display: "web:flex",
  alignItems: "web:center",
  justifyContent: "web:center",
  textAlign: "center",
  textDecorationLine: "none",
});

export type ActionChipTone = "neutral" | "danger" | "success" | "primary" | "outline";

/**
 * Label ink per tone — passed as an instance `color` so it reaches
 * the button's internal text element (see the frame note above).
 * These are the exact pairs the pages' hand-styled chips render
 * today: neutral gray2/gray8, soft danger danger1/danger8 (the pair
 * CardRow's danger action already canonicalized), success
 * success2/success9, the primary outline treatment, and the outline
 * chip's hairline/gray7.
 */
const toneLabelColors: Record<ActionChipTone, string> = {
  neutral: tokens.colors.gray.gray8,
  danger: tokens.colors.danger.danger8,
  success: tokens.colors.success.success9,
  primary: "$primaryEmphasis",
  outline: tokens.colors.gray.gray7,
};

/**
 * The icon glyph's ink per tone: the same colors as the label,
 * resolved to concrete values because react-native-svg cannot
 * resolve Tamagui theme variables — the `primary` tone's
 * $primaryEmphasis role is read from the active theme (Button's
 * useGlyphInk pattern), falling back to the base theme's value.
 */
function useGlyphInk(tone: ActionChipTone): string {
  const theme = useTheme();
  switch (tone) {
    case "danger":
      return tokens.colors.danger.danger8;
    case "success":
      return tokens.colors.success.success9;
    case "primary": {
      const variable = theme["primaryEmphasis"];
      return typeof variable?.val === "string" ? variable.val : tokens.colors.primary.primary8;
    }
    case "outline":
      return tokens.colors.gray.gray7;
    case "neutral":
    default:
      return tokens.colors.gray.gray8;
  }
}

/** Standard glyph size per chip size, for the icon slot. The md
 * glyph keeps the 24px Feather geometry the overview's icon chips
 * render at today. */
const glyphSizes = {
  sm: 18,
  md: 24,
} as const;

/**
 * The icon-only touch target per chip size: one square box (sm 44px,
 * md 48px — the $12 box the overview's print/share chips render),
 * clearing the 44px touch-target floor.
 */
const iconOnlyBoxes = {
  sm: 44,
  md: 48,
} as const;

/** Label font size per chip size, for the href form's label text
 * (Button's labelFontSizes pattern: the anchor's label renders in
 * one nested text element carrying its own typography). */
const labelFontSizes = {
  sm: tokens.typography.fontSize.sm,
  md: tokens.typography.fontSize.md,
} as const;

type ActionChipOwnProps = {
  /**
   * The chip's treatment: `neutral` (default — gray fill, the
   * overview action chips), `danger` (soft danger fill for
   * destructive actions), `success` (soft success fill), `primary`
   * (primary-tinted outline), `outline` (transparent, hairline
   * border).
   */
  tone?: ActionChipTone;
  /** `sm` (default) is the in-content chip; `md` matches the
   * standard button's geometry for action rows. */
  size?: "sm" | "md";
  disabled?: boolean;
};

/** The press form's label/icon shapes (activation by callback). */
type ActionChipPressShapes =
  | {
      /** The chip's label. */
      children: string;
      /** Optional leading icon (a DS icon component). */
      icon?: ComponentType<IconComponentProps>;
      accessibilityLabel?: string;
    }
  | {
      children?: undefined;
      /** The chip's only content — an icon component. */
      icon: ComponentType<IconComponentProps>;
      /** Required when icon-only: the chip's accessible name. */
      accessibilityLabel: string;
    };

export type ActionChipProps = ActionChipOwnProps &
  (
    | (ActionChipPressShapes & {
        onPress: () => void;
        href?: undefined;
      })
    | {
        /**
         * The link's destination. Giving the chip an `href` makes
         * it a LINK (#248's navigation rule, Button's two-form
         * contract): on web it renders a real anchor carrying the
         * href, and on native a press opens the href through the
         * platform link path — so on native the host passes an
         * absolute URL, as with every DS href form. The frame,
         * tones, and sizes are the press form's own — only the
         * element and the activation differ.
         */
        href: string;
        /** A link navigates — press callbacks belong to the press form. */
        onPress?: never;
        /**
         * The icon slot belongs to the press form: an anchor's
         * content is its label text (a navigating control that
         * needs richer content is a card/row link, not a chip).
         */
        icon?: never;
        /** The chip's label. A labeled link is named by its text. */
        children: string;
        accessibilityLabel?: string;
      }
  );

type ActionChipRenderProps = ActionChipOwnProps & {
  onPress?: () => void;
  href?: string;
  children?: string;
  icon?: ComponentType<IconComponentProps>;
  accessibilityLabel?: string;
};

/**
 * A small tonal action chip: the compact action control pages used
 * to hand-style out of Button — the neutral overview chips
 * (print/share/edit on RecipeDetailPage, whose `neutralChipProps`
 * spread this replaces), the soft-toned lifecycle actions (mark
 * perfected, abandon, delete), the primary-outline tweak action, and
 * the hairline outline actions. Extracted as a shared component for
 * the #119 page de-styling program: the chip owns its fill, border,
 * ink, and geometry behind the semantic `tone`, so pages compose
 * actions without styling them. Content is caller-supplied (a label
 * and/or a DS icon), so the chip serves any app.
 *
 * The icon slot mirrors Button's: an icon component renders left of
 * the label in the tone's ink; with no label the chip is icon-only —
 * a square target that requires `accessibilityLabel`.
 *
 * One component, two forms (#248's navigation rule, Button's
 * contract): pass `onPress` and the chip is a button element with a
 * callback; pass `href` and the chip is a link — a real anchor on
 * web, the platform link path on native — with the identical frame.
 * The href form is label-only, like Button's: the overview's Edit
 * chips and the lifecycle's Tweak-with-AI chip navigate, and they
 * render through it.
 */
export function ActionChip(props: ActionChipProps) {
  const {
    tone = "neutral",
    size = "sm",
    onPress,
    href,
    disabled = false,
    icon: IconGlyph,
    children,
    accessibilityLabel,
  } = props as ActionChipRenderProps;
  const glyphInk = useGlyphInk(tone);
  if (href !== undefined) {
    const linkA11yProps = platformAccessibilityProps({
      accessibilityRole: "link",
      accessibilityLabel,
      accessibilityState: { disabled },
    });
    return (
      <StyledLinkChip
        {...linkA11yProps}
        // A disabled link is not followable: the href is withheld
        // entirely (ARIA's disabled-link pattern — the attribute
        // is absent, not empty) while the disabled state above
        // still announces it. On native the Anchor opens the href
        // only when one is present, so the press is inert too.
        {...(disabled ? {} : { href })}
        disabled={disabled}
        tone={tone}
        size={size}
        color={toneLabelColors[tone]}
        // The bare font name ("body") is the form that makes
        // Tamagui emit the font-context class defining
        // `--f-family` for the label text (see Text, #69).
        fontFamily="body"
      >
        <TamaguiText
          color={toneLabelColors[tone]}
          fontFamily="$body"
          fontSize={labelFontSizes[size as keyof typeof labelFontSizes] ?? labelFontSizes.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
        >
          {children}
        </TamaguiText>
      </StyledLinkChip>
    );
  }
  const iconOnly = IconGlyph != null && !children;
  const glyphSize = glyphSizes[size as keyof typeof glyphSizes] ?? glyphSizes.sm;
  const iconOnlyBox = iconOnlyBoxes[size as keyof typeof iconOnlyBoxes] ?? iconOnlyBoxes.sm;
  const a11yProps = platformAccessibilityProps({
    accessibilityRole: "button",
    accessibilityLabel,
    accessibilityState: { disabled },
  });
  return (
    <StyledChip
      {...a11yProps}
      onPress={onPress}
      disabled={disabled}
      tone={tone}
      size={size}
      color={toneLabelColors[tone]}
      // The bare font name ("body") is the form that makes Tamagui
      // emit the font-context class defining `--f-family` for the
      // internal text element (see Text, #69).
      fontFamily="body"
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
    >
      {IconGlyph ? <IconGlyph size={glyphSize} color={glyphInk} /> : null}
      {children}
    </StyledChip>
  );
}
