import { ScrollView } from "tamagui";

import { Col } from "../layout/Col.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { Text } from "../data/Text.js";
import { TextSkeleton } from "../feedback/TextSkeleton.js";
import { tokens } from "../../tokens/index.js";

export type OverlayTextPanelProps = {
  /** The panel's heading line, pre-composed by the caller. */
  heading: string;
  /** The panel's text lines, pre-formatted by the caller. */
  lines: string[];
  /**
   * Loading state (#278): the heading renders as a text
   * skeleton at its own (sm) size and the lines as one text
   * skeleton per line at sm — or exactly 3 dummy line bones
   * when no lines are known yet — inside the same panel
   * frame, with no real heading or line text.
   */
  loading?: boolean;
};

// The loading panel's dummy lines (#278): exactly 3
// placeholder lines when none are known, from a frozen
// module-level constant — never generated per render. A
// loading panel over known lines mirrors its own lines
// instead (one bone per line).
const LOADING_LINE_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * A text panel on a dark overlay (#698 tranche 3): a
 * translucent panel carrying a heading and a scrollable
 * list of pre-formatted lines — the panel a step overlay
 * shows beside its step. The panel's dark treatment
 * composes the theme's $surface at layered opacity (the
 * RatingForm dark variant's precedent), so it stays
 * theme-correct on the overlay's dark shell; the lines
 * scroll inside a 160px cap instead of growing the panel.
 * Heading and lines cross pre-composed as data: formatting
 * stays with the caller.
 */
export function OverlayTextPanel({ heading, lines, loading = false }: OverlayTextPanelProps) {
  return (
    <Col borderRadius={tokens.radii.xl} overflow="hidden">
      <Col
        position="absolute"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        backgroundColor="$surface"
        opacity={0.05}
      />
      <Col
        p="m"
        gap="s"
        {...(loading ? platformAccessibilityProps({ accessibilityState: { busy: true } }) : {})}
      >
        {loading ? (
          <TextSkeleton size="sm" lines={1} />
        ) : (
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.semibold}
            color="$surface"
          >
            {heading}
          </Text>
        )}
        <ScrollView maxHeight={160} nestedScrollEnabled>
          <Col gap="xs">
            {loading
              ? lines.length > 0
                ? lines.map((_, index) => <TextSkeleton key={index} size="sm" lines={1} />)
                : LOADING_LINE_KEYS.map((key) => <TextSkeleton key={key} size="sm" lines={1} />)
              : lines.map((line, index) => (
                  <Text key={index} fontSize={tokens.typography.fontSize.sm} color="$surface">
                    {line}
                  </Text>
                ))}
          </Col>
        </ScrollView>
      </Col>
    </Col>
  );
}
