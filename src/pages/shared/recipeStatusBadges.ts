import type { BadgeProps } from "../../widgets/data/Badge.js";

/**
 * STATUS_BADGES (#587 phase 3 tranche 5): the status badge map the
 * merged recipe page's owner form carries (#757) — labels and
 * tones for the app's four statuses
 * (idea → neutral gray, evolving → info blue, perfected → success
 * green, abandoned → danger red, matching the app's badge tints).
 * The two pre-merge recipe pages each carried an identical
 * copy; the map now lives here. The vocabulary stays
 * caller data at the pages layer — the shared Badge takes the tone
 * and the label as its child and owns only the rendering (Stephen's
 * #119 dedupe ruling: no DS-owned status vocabulary in shared
 * components). Unknown statuses fall back to `idea` at the call
 * sites, as the app's normalizer does.
 */
export const STATUS_BADGES: Record<
  string,
  { label: string; tone: NonNullable<BadgeProps["tone"]> }
> = {
  idea: { label: "Idea", tone: "neutral" },
  evolving: { label: "Evolving", tone: "info" },
  perfected: { label: "Perfected", tone: "success" },
  abandoned: { label: "Abandoned", tone: "danger" },
};
