import { Children, Fragment, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledEqualButtonRow = styled(XStack, {
  name: "EqualButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
});

type StyledEqualButtonRowProps = GetProps<typeof StyledEqualButtonRow>;

export type EqualButtonRowProps = Omit<StyledEqualButtonRowProps, "gap" | "flexWrap">;

/**
 * The minimum width each button in the row claims, as a share of
 * the row's width: at 40%, two buttons fit a line as equal halves
 * and a third wraps instead of squeezing the line to thirds — a
 * lone button on a wrapped line then grows to fill that line.
 */
const EQUAL_BUTTON_MIN_WIDTH = "40%";

/**
 * Flatten the row's children into its items: a variant fragment a
 * caller wraps its buttons in contributes its own children, and
 * the child forms that render nothing (null, undefined, booleans)
 * drop out.
 */
function flattenRowChildren(children: ReactNode): ReactNode[] {
  const items: ReactNode[] = [];
  const push = (node: ReactNode) => {
    if (node === null || node === undefined || typeof node === "boolean") return;
    items.push(node);
  };
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      Children.forEach((child as ReactElement<{ children?: ReactNode }>).props.children, push);
    } else {
      push(child);
    }
  });
  return items;
}

/**
 * A row of action buttons that share the row's width equally
 * (#119): the call-to-action bar treatment — a page's primary
 * intents presented as peers. The component owns the bar's whole
 * treatment: the 12px gap between buttons, wrapping onto the
 * next line at narrow widths, and the sizing of every button in
 * the row — each button grows to an equal share of its line
 * (flex 1) with a 40% minimum width, so two buttons render as
 * equal halves, three render as two halves over one full-width
 * button, and no button ever shrinks below the floor or wraps
 * its own label to fit. Callers pass only the buttons: there
 * are no sizing or spacing props, by design — the row sizes its
 * buttons itself, so no call site sizes a button.
 *
 * The sibling treatment is ButtonRow: same 12px gap and wrap,
 * but its buttons keep their natural widths — a bar that follows
 * content. This row is for bars whose buttons are the content's
 * peers and must read as equals. Separation from what precedes
 * the bar is owned by the parent, exactly as with ButtonRow:
 * margin props are abolished in all cases, and a parent that
 * supplies no separation gets a flush bar, by design.
 *
 * Extracted from PublicRecipePage's CTA bar, which hand-rolled
 * this sizing in the page (a raw stack plus per-button
 * cloneElement sizing) — styling a page may not apply itself
 * under #119. RecipeDetailPage's cooking-action bar hand-rolls
 * the same treatment and is the second consumer.
 */
export function EqualButtonRow({ children, ...rest }: EqualButtonRowProps) {
  const items = flattenRowChildren(children);
  return (
    <StyledEqualButtonRow {...rest}>
      {items.map((item, index) =>
        isValidElement(item) ? (
          cloneElement(item as ReactElement<{ flex?: number; minWidth?: string }>, {
            flex: 1,
            minWidth: EQUAL_BUTTON_MIN_WIDTH,
            key: (item as ReactElement).key ?? `button-${index}`,
          })
        ) : (
          <Fragment key={`button-${index}`}>{item}</Fragment>
        ),
      )}
    </StyledEqualButtonRow>
  );
}
