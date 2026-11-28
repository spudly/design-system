import type { ReactNode } from "react";

import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { Card, type CardProps } from "../layout/Card.js";
import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { Text } from "../data/Text.js";
import { TextSkeleton } from "../feedback/TextSkeleton.js";

export type SectionCardProps = CardProps & {
  title: string;
  /** Optional trailing element in the header row, e.g. an "Edit" button. */
  action?: ReactNode;
};

/**
 * Titled card section: a Card with a subheading title row and spacing below
 * it. Pass `action` for a trailing header element such as an Edit button.
 * Appearance comes from Card's `variant` prop ("default" | "bordered" |
 * "muted" | "elevated"), passed through via {@link SectionCardProps}.
 */
export function SectionCard({
  title,
  action,
  children,
  loading = false,
  ...rest
}: SectionCardProps) {
  // Loading (#278): the header title swaps for a text skeleton
  // at the subheading variant's size (xl), so the bone occupies
  // the title's own line box;
  // the header action stays rendered — the Card shell carries
  // the busy state and provides the LoadingScope, so a Button
  // action renders as an inert rectangle skeleton and the
  // section's own widgets skeletonize without prop-drilling. `loading`
  // arrives through CardProps (SectionCardProps extends it), and
  // an enclosing composite's LoadingScope puts the section into
  // the same state (the showSkeleton pattern every other
  // converted widget uses — CodeRabbit on #551).
  const showSkeleton = useLoadingScope(loading);
  return (
    <Card loading={showSkeleton} {...rest}>
      <Col>
        <Row between middle gap="s">
          {showSkeleton ? (
            <Col grow shrink>
              <TextSkeleton size="xl" lines={1} />
            </Col>
          ) : (
            <Text variant="subheading">{title}</Text>
          )}
          {action}
        </Row>
        <Spacer y="m" />
      </Col>
      <Col gap="m">{children}</Col>
    </Card>
  );
}
