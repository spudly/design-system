import { Badge, type BadgeProps } from "./Badge.js";

export type StatusBadgeTone = NonNullable<BadgeProps["tone"]>;

export type StatusBadgeProps = {
  /**
   * The status's tone — the caller maps its own status
   * vocabulary to a Badge tone (see the component note).
   */
  tone: StatusBadgeTone;
  /** The status's display label, caller-supplied. */
  label: string;
};

/**
 * A status badge (#119 dedupe): a Badge that names a piece of
 * content's status — the header block of a detail page, a row
 * in a list. Both recipe tranches coined this component
 * independently with the same shape, so it ships once, here.
 *
 * The caller passes the tone AND the label (Stephen's ruling
 * on the #119 dedupe, 2026-10-29): there is deliberately no
 * DS-owned status vocabulary — no map from one app's status
 * strings ("idea", "evolving", …) to tones and labels baked
 * into the design system, the same data-ownership principle
 * that keeps filter option sets out of CatalogFiltersBar. An
 * app's status lifecycle is its own data; this component owns
 * only the rendering.
 */
export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return <Badge tone={tone}>{label}</Badge>;
}
