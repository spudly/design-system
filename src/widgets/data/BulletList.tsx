import type { ReactNode } from "react";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { listItemRoleProps, listRoleProps } from "../accessibility.js";
import { Text } from "./Text.js";

export type BulletListProps = {
  /** The list's items, one rendered node (a span run) per item. */
  items: ReactNode[];
};

/**
 * A bulleted prose list (#119): each item is a bullet glyph
 * beside a flexing text wrapping the item's node, the items
 * separated by the 8px list rhythm and marked as a list on
 * web (via `listRoleProps` / `listItemRoleProps`). Call sites
 * pass only the items: there are no spacing props, by design
 * — the list owns the geometry.
 */
export function BulletList({ items }: BulletListProps) {
  return (
    <Col gap="s" {...listRoleProps}>
      {items.map((item, index) => (
        <Row key={index} gap="s" {...listItemRoleProps}>
          <Text>{"•"}</Text>
          <Text flex={1}>{item}</Text>
        </Row>
      ))}
    </Col>
  );
}
