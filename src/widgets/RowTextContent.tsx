import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type RowTextContentProps = {
  /** The row's main line. */
  title: string;
  /** Optional second line under the title. */
  subtitle?: string | null;
  /** Marks the visible texts non-accessible for a native link
   * rendering whose LinkOverlay carries the label as the row's
   * one accessibility stop (see LinkOverlay). */
  decorative?: boolean;
};

/**
 * The stacked title/subtitle text block shared by the card rows
 * (CardRow, TextActionCardRow): a semibold title line with an
 * optional hint subtitle under it. Extracted for #587 phase 2 —
 * both rows carried an identical copy of this rendering.
 */
export function RowTextContent({ title, subtitle, decorative = false }: RowTextContentProps) {
  return (
    <>
      <Text
        accessible={decorative ? false : undefined}
        importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.semibold}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="hint"
          accessible={decorative ? false : undefined}
          importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        >
          {subtitle}
        </Text>
      ) : null}
    </>
  );
}
