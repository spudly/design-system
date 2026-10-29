import type { ComponentType } from "react";
import { Button as TamaguiButton, styled, useTheme } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The chip frame: Button's geometry at the small end of its scale,
 * with the fill/border owned by the `tone` variant. The label ink is
 * NOT set here — a styled() variant's `color` styles only the frame,
 * not Tamagui Button's internal text element (the lesson Button's
 * variantLabelColors records), so the wrapper passes the tone's ink
 * as an instance `color` prop at render.
 */
const StyledChip = styled(TamaguiButton, {
  name: "ActionChip",

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
  },
});

type StyledChipProps = GetProps<typeof StyledChip>;

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

type ActionChipBaseProps = {
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
  onPress: () => void;
  disabled?: boolean;
};

export type ActionChipProps = ActionChipBaseProps &
  (
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
      }
  );

type ActionChipRenderProps = Omit<StyledChipProps, "tone" | "size" | "children"> &
  ActionChipBaseProps & {
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
 * a square target that requires `accessibilityLabel`. Activation is
 * always a callback (`onPress`): a control that navigates is a link,
 * never a chip (#248's navigation rule).
 */
export function ActionChip(props: ActionChipProps) {
  const {
    tone = "neutral",
    size = "sm",
    onPress,
    disabled = false,
    icon: IconGlyph,
    children,
    accessibilityLabel,
  } = props as ActionChipRenderProps;
  const glyphInk = useGlyphInk(tone);
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
