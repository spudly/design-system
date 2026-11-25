import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";
import { tokens } from "../../tokens/index.js";

export type ToolbarProps = Omit<
  RowProps,
  "wrap" | "middle" | "gap" | "borderBottomWidth" | "borderBottomColor" | "px" | "py"
>;

/**
 * A screen's pinned toolbar (#119): the hairline-divided bar a
 * fixed-shell page renders above its scroll
 * region — status and context items at their natural size, a
 * growing field (SelectField's `grow`) taking the remaining
 * width, items wrapping onto a second line when the bar
 * narrows. The bar owns its inset, gap, and divider outright;
 * its contents are caller-supplied.
 */
export function Toolbar({ ...rest }: ToolbarProps) {
  return (
    <Row
      wrap
      middle
      gap="s"
      px="l"
      py="m"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      {...rest}
    />
  );
}
