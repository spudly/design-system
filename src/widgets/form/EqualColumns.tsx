import { Children } from "react";
import type { ReactNode } from "react";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";

export type EqualColumnsProps = {
  /** The children, one per column — any content: fields, cards, stats, actions. */
  children: ReactNode;
};

/**
 * A row of equal-width columns: each child gets an equal
 * share of the row's width, with the standard 12px gutter
 * between columns. Any content can want this shape — a
 * form's short-field row (servings / prep / cook on the
 * recipe form) is one example, not the definition. The
 * columns are the component's own: call sites pass only
 * the children, and no column widths or gaps cross as
 * props. Empty children (a conditional child that rendered
 * nothing) get no column — the remaining children share
 * the full row.
 */
export function EqualColumns({ children }: EqualColumnsProps) {
  return (
    <Row gap="m">
      {Children.map(children, (child) =>
        child == null || typeof child === "boolean" ? null : (
          <Col grow shrink>
            {child}
          </Col>
        ),
      )}
    </Row>
  );
}
