import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { Card } from "../layout/Card.js";

import { BoxSkeleton } from "./BoxSkeleton.js";
import { TextSkeleton } from "./TextSkeleton.js";

// Structural flex only: the card's text block expands and may
// shrink within the row, mirroring the loaded media row's text
// block (recipeRow's textBlockStyle — the explicit flexBasis
// keeps the block from collapsing to ~0dp on narrow viewports
// once the fixed 64dp thumbnail takes its share).
const textBlockStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 60, minWidth: 0 } as const;

/**
 * A media list's loading row (#119, #278): an elevated card in
 * the MediaRow shape — a 64dp box bone where the thumbnail sits
 * and title/subtitle bones at the row's text sizes, the region
 * marked busy, carrying the 12px bottom separation the catalog
 * rows use while loading. The row owns its shape and
 * separation; call sites render one per loading row inside a
 * LoadingScope and pass nothing.
 */
export function LoadingMediaRow() {
  return (
    <Col>
      <Card
        variant="elevated"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        gap="m"
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        <BoxSkeleton width={64} height={64} />
        <Col style={textBlockStyle} gap="xs">
          <TextSkeleton size="md" lines={1} />
          <TextSkeleton size="sm" lines={1} />
        </Col>
      </Card>
      <Spacer y="m" />
    </Col>
  );
}
