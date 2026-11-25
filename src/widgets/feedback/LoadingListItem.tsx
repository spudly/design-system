import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { TextSkeleton } from "./TextSkeleton.js";

/**
 * A check list's loading row (#119, #278): a 24px box bone — the
 * skeleton shape of the CheckboxField list shape's checkbox
 * (#713) — beside a medium text bone flexing to the row's width,
 * on the list row's own rhythm: 12px vertical padding, a 12px
 * gap, top-aligned, and a transparent 1px bottom border matching
 * the loaded rows' hairline slot (the loading list renders no
 * visible rule). The bone stays 24px and sits in a container
 * sized to the label's first-line height (fontSize.md ×
 * lineHeight.normal) with the bone centered in it — the loaded
 * row's first-line alignment rhythm. The row owns its shape and
 * rhythm; call sites render one per loading row inside a
 * LoadingScope and pass nothing.
 */
export function LoadingListItem() {
  return (
    <Row top gap="m" py="m" borderBottomWidth={1} borderBottomColor="transparent">
      <Row
        height={tokens.typography.fontSize.md * tokens.typography.lineHeight.normal}
        middle
        center
      >
        <BoxSkeleton width={24} height={24} />
      </Row>
      <Col grow shrink>
        <TextSkeleton size="md" lines={1} />
      </Col>
    </Row>
  );
}
