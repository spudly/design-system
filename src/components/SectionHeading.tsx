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
 */
export function SectionHeading({ children }: SectionHeadingProps) {
  return <Text variant="subheading">{children}</Text>;
}
