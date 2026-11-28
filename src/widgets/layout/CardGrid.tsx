import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { tokens } from "../../tokens/index.js";

import { Row } from "./Row.js";

export type CardGridProps = {
  children: ReactNode;
};

/**
 * A wrapping grid of cards (#119): the cards flow in rows
 * with the 12px grid gap, each card growing to share its row
 * (flex 1) from a 260px wrap basis, with the 8px internal
 * card rhythm. The grid sizes its cards itself — it clones
 * each child with the flex, basis, and gap (the ButtonRow
 * cloneElement precedent) — so call sites supply plain cards
 * with no styling props. There are no spacing props, by
 * design: the grid owns the geometry.
 */
export function CardGrid({ children }: CardGridProps) {
  return (
    <Row wrap gap="m">
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(
              child as ReactElement<{ flex?: number; flexBasis?: number; gap?: string }>,
              {
                flex: 1,
                flexBasis: 260,
                gap: "$2",
              },
            )
          : child,
      )}
    </Row>
  );
}
