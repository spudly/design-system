import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";

export type FieldRowProps = Omit<RowProps, "gap" | "stretch">;

/**
 * A row of form fields and their action (#119): a field (given
 * SearchField's `grow`, or a text field's own flex) takes the
 * row's remaining width, and FieldRow owns the equal-height
 * contract (#476): children stretch to the row's common
 * height — the tallest child, normally the action button at
 * its natural height — so a field and its button render at
 * exactly one height, with an 8px gap — the shape of a search
 * row, a filter row, an invite-by-email row on any site. The
 * stretch is structural, not cosmetic (eciperay #188): an
 * action's natural height can be shorter than the field's (the
 * catalog bar's small Filters button is), and a row that does
 * not stretch it leaves the bar's controls at two heights.
 * Call sites pass only the fields and the action: there are
 * no spacing props, by design. (SearchRow, which carried only
 * this stretch difference, was consolidated into this
 * component — #481.)
 *
 * #746 (Option B): the row renders Row directly — the 8px gap
 * is gap "s", the stretch is Row's `stretch`. No styled root.
 */
export function FieldRow({ ...rest }: FieldRowProps) {
  return <Row gap="s" stretch {...rest} />;
}
