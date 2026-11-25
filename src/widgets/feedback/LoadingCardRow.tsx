import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { Card } from "../layout/Card.js";
import { TextSkeleton } from "./TextSkeleton.js";

/**
 * A card list's loading row (#119, #278): a card holding a
 * medium title bone over a small subtitle bone — the skeleton
 * shape of a card row (a recipe card in a list) — carrying the
 * 12px bottom separation the card lists' rows use while loading,
 * because the loading list itself adds no gap. The row owns its
 * shape and separation; call sites render one per loading row
 * inside a LoadingScope and pass nothing.
 */
export function LoadingCardRow() {
  return (
    <Col>
      <Card>
        <TextSkeleton size="md" lines={1} />
        <TextSkeleton size="sm" lines={1} />
      </Card>
      <Spacer y="m" />
    </Col>
  );
}
