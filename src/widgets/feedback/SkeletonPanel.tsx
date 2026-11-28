import { Col } from "../layout/Col.js";
import type { ColProps } from "../layout/Col.js";

export type SkeletonPanelProps = Omit<ColProps, "width" | "gap" | "p">;

/**
 * A skeleton panel (#698 tranche 4): the padded, full-width
 * column a loading fallback's bones sit in — a large box
 * bone, text lines, a second box bone — at the 12px rhythm
 * with the 16px panel inset. Call sites pass only the
 * bones (and the busy marker): there are no spacing
 * props, by design.
 */
export function SkeletonPanel({ ...rest }: SkeletonPanelProps) {
  return <Col width="100%" gap="m" p="l" {...rest} />;
}
