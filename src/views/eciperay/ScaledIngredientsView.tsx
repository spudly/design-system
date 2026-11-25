import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { OverlayTextPanel } from "../../widgets/content/OverlayTextPanel.js";

export type ScaledIngredientsViewProps = {
  /** The panel's heading line, pre-composed by the caller ("Ingredients · 4 servings (scaled ×2)"). */
  heading: string;
  /** The scaled ingredient lines, pre-formatted by the caller. */
  lines: string[];
  /** Loading state (#278): the heading renders as a text
   * skeleton at its own (sm) size and the lines as one text
   * skeleton per line at sm — or exactly 3 dummy line bones
   * when no lines are known yet — inside the same translucent
   * panel frame, with no real heading or ingredient text. An
   * enclosing composite's LoadingScope can also put the panel
   * into this state without prop-drilling. */
  loading?: boolean;
};

/**
 * ScaledIngredientsView (#438 Part 3): the cooking mode's
 * scaled-ingredients panel as a view — a translucent panel on
 * the step overlay carrying the heading and the scrollable,
 * pre-formatted ingredient lines — composed so the recipe
 * CookingModePage renders it through StepOverlay's accessory
 * slot and hosts no longer compose Text on the overlay
 * themselves (the eciperay audit's coverage disposition for
 * that specifier).
 *
 * Scaling and formatting stay with the caller: the heading
 * and lines cross pre-composed, the same view-model rule the
 * cooking pages keep for step bodies. The panel's dark
 * treatment composes the theme's $surface at layered opacity
 * (the RatingForm dark variant's precedent), so it stays
 * theme-correct on the overlay's dark shell.
 */
export function ScaledIngredientsView({
  heading,
  lines,
  loading = false,
}: ScaledIngredientsViewProps) {
  const showSkeleton = useLoadingScope(loading);
  return <OverlayTextPanel heading={heading} lines={lines} loading={showSkeleton} />;
}
