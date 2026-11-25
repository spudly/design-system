import type { ReactNode } from "react";
import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { FieldLabel } from "../form/FieldLabel.js";

/**
 * The one label row the labeled form compositions share
 * (#119 dedupe): the FieldLabel on the left, the optional
 * action cluster right-aligned beside it at its own 8px
 * rhythm, and the caller's separation below the row (a single
 * field's 4px, a control group's 8px — the wrappers' only
 * difference). Internal: LabeledField and LabeledGroup are
 * the shipped compositions; this module is not exported.
 */
export function LabelRow({
  label,
  action,
  separation,
  htmlFor,
}: {
  label: string;
  action?: ReactNode;
  /** The space below the row, as a spacing-scale step. */
  separation: 1 | 2;
  /** The field control's id, forwarded to the label so the web
   * label element's `for` names that control. */
  htmlFor?: string | undefined;
}) {
  return (
    // The separation below the row is a Spacer sibling inside a
    // gapless Col (#746): Row's padding props are uniform per
    // axis, so the single-side inset composes this way (the
    // LabeledField/LabeledGroup pattern).
    <Col>
      <Row middle between gap="m">
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        {action ? (
          <Row middle gap="s">
            {action}
          </Row>
        ) : null}
      </Row>
      <Spacer y={separation === 1 ? "xs" : "s"} />
    </Col>
  );
}
