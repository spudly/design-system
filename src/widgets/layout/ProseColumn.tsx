import { Col } from "./Col.js";
import type { ColProps } from "./Col.js";

/**
 * The prose column width: the same 768px (the web layout's
 * max-w-3xl) centered column the other public surfaces render
 * into, so the prose stays readable on wide viewports. The
 * frame header and footer stay outside the column, spanning
 * the container as before; on phone-width viewports the cap
 * does not bind.
 */
const PROSE_MAX_WIDTH = 768;

export type ProseColumnProps = Omit<ColProps, "width" | "maxWidth" | "alignSelf" | "gap">;

/**
 * A prose document's column (#119): full width up to the
 * 768px readable measure, centered, its blocks separated by
 * the 16px prose rhythm. Call sites pass the document's
 * blocks and any landmark props (the page passes
 * `mainRoleProps`): there are no spacing or sizing props, by
 * design — the column owns the geometry.
 *
 * #746 (Option B): the column renders Col directly — the
 * geometry is Col's own props (the 16px rhythm is gap "l"),
 * no styled root.
 */
export function ProseColumn({ ...rest }: ProseColumnProps) {
  return <Col width="100%" maxWidth={PROSE_MAX_WIDTH} alignSelf="center" gap="l" {...rest} />;
}
