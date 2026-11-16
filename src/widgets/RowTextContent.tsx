import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type RowTextContentProps = {
  /** The row's main line. */
  title: string;
  /** Optional second line under the title. */
  subtitle?: string | null | undefined;
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
/**
 * The hint subtitle line under a row's title, shared by
 * RowTextContent and ListRow (#587 phase 3): both row families
 * render the identical hint text with the same decorative
 * treatment, so it lives in exactly one place.
 */
export function RowSubtitleText({
  subtitle,
  decorative = false,
}: {
  subtitle: string;
  decorative?: boolean;
}) {
  return (
    <Text
      variant="hint"
      accessible={decorative ? false : undefined}
      importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
    >
      {subtitle}
    </Text>
  );
}

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
      {subtitle ? <RowSubtitleText subtitle={subtitle} decorative={decorative} /> : null}
    </>
  );
}
