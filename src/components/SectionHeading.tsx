import { Text } from "./Text.js";

export type SectionHeadingProps = {
  /** The section's heading text. */
  children: string;
};

/**
 * A detail page's section heading (#119 dedupe): the heading
 * that opens a section of a detail page — a recipe's
 * Ingredients, its Instructions, a profile's sections.
 *
 * The canonical treatment is Text's `subheading` variant and
 * nothing else (Stephen's ruling on the #119 dedupe,
 * 2026-10-29): the two recipe tranches had shipped two
 * different headings under this name — an extracted block
 * carrying a large semibold treatment with its inset and top
 * offset baked in, and a bare subheading Text — and the bare
 * subheading is the form that survives. There is deliberately
 * NO padding here: separation and inset are the parent's (a
 * panel's padding, a stack's gap), the same parent-owns-spacing
 * rule that removed the padded offsets from the list states —
 * a heading that carries its own offset is a margin by another
 * name.
 *
 * Heading semantics (#317): a section heading is a heading,
 * not plain text — screen-reader heading navigation must be
 * able to jump between a detail page's sections. Following
 * the #263 heading regime (page titles at level 1), the label
 * carries the heading role at level 2, stated explicitly here
 * rather than left to the `subheading` variant's default in
 * Text: `accessibilityRole="header"` plus `aria-level={2}`.
 * On web, Text's platform translator renders that as
 * `role="heading"` with `aria-level="2"`; on native the
 * `header` role alone carries heading navigation (React
 * Native has no heading-level prop, so the translator drops
 * `aria-level` there).
 */
export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Text variant="subheading" accessibilityRole="header" aria-level={2}>
      {children}
    </Text>
  );
}
