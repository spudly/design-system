import { Badge } from "./Badge.js";

export type MetadataBadgeProps = {
  /**
   * The summary parts in display order (e.g. category, total time,
   * servings). Empty and missing parts are dropped; the rest are
   * joined with " • ". Domain wording (e.g. a "Serves" prefix) is
   * composed by the caller into its parts — this widget owns only
   * the joining and the pill treatment.
   */
  parts: readonly (string | undefined)[];
};

/**
 * The metadata pill: a one-line summary badge joining its parts
 * with " • " (extracted from RecipeDetailPage at Stephen's review
 * on PR #730, 2026-11-21 — a composite rendered on a page must be
 * a reusable widget taking its parts as props, never defined
 * inline in a page file). Renders through Badge's success tone —
 * the sage treatment, which lives in the success color tokens.
 * Renders nothing when no part is present.
 */
export function MetadataBadge({ parts }: MetadataBadgeProps) {
  const present = parts.filter((part): part is string => part !== undefined && part !== "");
  if (present.length === 0) {
    return null;
  }
  return <Badge tone="success">{present.join(" • ")}</Badge>;
}
