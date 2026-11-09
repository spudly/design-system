import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";

const StyledCard = styled(YStack, {
  name: "Card",

  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[4],

  variants: {
    variant: {
      // Standard section surface: filled and bordered.
      default: {},
      // Outline only — no surface fill; content sits on the page background.
      bordered: {
        backgroundColor: "transparent",
      },
      // Recessed section: page-background fill, no border.
      muted: {
        backgroundColor: "$background",
        borderWidth: 0,
      },
      // Raised section: filled, soft shadow instead of a border.
      elevated: {
        borderWidth: 0,
        shadowColor: tokens.shadows.md.shadowColor,
        shadowOffset: tokens.shadows.md.shadowOffset,
        shadowOpacity: tokens.shadows.md.shadowOpacity,
        shadowRadius: tokens.shadows.md.shadowRadius,
      },
      // Compact surface: filled, no border — 12px padding, the
      // medium radius, the small shadow. The dense-row treatment
      // (tag rows, inline editors), folded in from the former
      // CompactCard under Stephen's 2026-10-29 ruling: a surface
      // treatment difference is a variant of Card, not a
      // separate component.
      compact: {
        borderWidth: 0,
        borderRadius: tokens.radii.md,
        padding: tokens.spacing[3],
        shadowColor: tokens.shadows.sm.shadowColor,
        shadowOffset: tokens.shadows.sm.shadowOffset,
        shadowOpacity: tokens.shadows.sm.shadowOpacity,
        shadowRadius: tokens.shadows.sm.shadowRadius,
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

type StyledCardProps = GetProps<typeof StyledCard>;

export type CardProps = StyledCardProps & {
  /**
   * Appearance: `default` (filled, bordered), `bordered` (outline only),
   * `muted` (page-background fill, no border), `elevated` (filled, soft
   * shadow, no border), `compact` (filled, no border — 12px padding,
   * medium radius, small shadow; dense rows and inline editors).
   */
  variant?: "default" | "bordered" | "muted" | "elevated" | "compact";
  /** @deprecated Use `variant="elevated"` instead. Kept for existing consumers. */
  elevated?: boolean;
  /** Loading state (#278): the card marks its region busy and
   * provides a LoadingScope to its children, so nested DS
   * widgets render their skeleton states without the caller
   * prop-drilling the flag into each one. The card's own frame
   * (fill, border, padding) is unchanged. */
  loading?: boolean;
};

/**
 * Surface container with token-driven padding and radius. Appearance comes
 * from `variant` (see {@link CardProps}); the legacy `elevated` boolean maps
 * to `variant="elevated"` when no variant is given.
 */
export function Card({
  variant,
  elevated = false,
  style,
  loading = false,
  children,
  ...rest
}: CardProps) {
  const resolvedVariant = variant ?? (elevated ? "elevated" : "default");
  // Android shadow for the shadowed variants: `elevation` comes from the same
  // shadow token as the iOS shadow props above and is applied via `style`,
  // because Tamagui v3's styled() typing accepts it in neither the static
  // config nor this component's props. It is composed as a style array under
  // the caller's style (React Native flattens arrays left to right), so
  // unrelated caller styles — including caller style arrays — preserve the
  // shadow and an explicit caller elevation wins.
  const elevation =
    resolvedVariant === "elevated"
      ? tokens.shadows.md.elevation
      : resolvedVariant === "compact"
        ? tokens.shadows.sm.elevation
        : undefined;
  const composedStyle = [elevation !== undefined ? { elevation } : undefined, style];
  // The scope this card provides combines its own flag with any
  // enclosing scope: a plain Card nested inside a loading
  // composite must not reset the scope to false for its subtree
  // (CodeRabbit on #551 — an inner Card inside a loading Card
  // would otherwise un-skeletonize everything below it).
  const showSkeleton = useLoadingScope(loading);
  // The busy marking merges with — never replaces or yields to —
  // a caller's own accessibility state (CodeRabbit on #551): the
  // caller's state fields ride along, `busy` is forced on while
  // loading, and the merged props spread after `rest` so a
  // caller-supplied `accessibilityState` / `aria-busy` in `rest`
  // cannot silently drop the busy state. The caller's explicit
  // ARIA state values are forwarded into the translation too, so
  // the translator's ARIA-wins precedence still decides every
  // field except `busy` itself (CodeRabbit on #551, round 3).
  const caller = rest as {
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean | "mixed";
      busy?: boolean;
      expanded?: boolean;
    };
    "aria-busy"?: boolean;
    "aria-checked"?: boolean | "mixed";
    "aria-disabled"?: boolean;
    "aria-expanded"?: boolean;
    "aria-selected"?: boolean;
  };
  return (
    <StyledCard
      variant={resolvedVariant}
      style={composedStyle}
      {...rest}
      {...(showSkeleton
        ? platformAccessibilityProps({
            accessibilityState: { ...caller.accessibilityState, busy: true },
            "aria-busy": true,
            "aria-checked": caller["aria-checked"],
            "aria-disabled": caller["aria-disabled"],
            "aria-expanded": caller["aria-expanded"],
            "aria-selected": caller["aria-selected"],
          })
        : {})}
    >
      <LoadingScope active={showSkeleton}>{children}</LoadingScope>
    </StyledCard>
  );
}
