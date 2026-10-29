import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { XStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledRow = styled(XStack, {
  name: "EqualButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
});

export type EqualButtonRowProps = {
  /** The row's buttons. A fragment child is flattened into the
   * row, so a caller can pass a variant's button set as one
   * fragment. */
  children: ReactNode;
};

/**
 * A row of action buttons that share the row's width equally
 * (#119): the row sizes each button itself — flex 1 with a 40%
 * minimum width — so buttons sharing a line split its width
 * equally and share its height, a button alone on a wrapped
 * line fills that line, and no button shrinks below the 40%
 * minimum instead of wrapping:
 * the call-to-action bar treatment PublicRecipePage's CTA card
 * hand-styled onto its Buttons before this component.
 * ButtonRow is the natural-width sibling: it owns the same 12px
 * gap and wrapping, but its buttons keep their content width.
 * Call sites pass only the buttons; the sizing lives here, so
 * no page sizes a button itself.
 */
export function EqualButtonRow({ children }: EqualButtonRowProps) {
  const items: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") return;
    if (isValidElement(child) && child.type === Fragment) {
      Children.forEach(
        (child as ReactElement<{ children?: ReactNode }>).props.children,
        (inner) => {
          if (inner === null || inner === undefined || typeof inner === "boolean") return;
          items.push(inner);
        },
      );
      return;
    }
    items.push(child);
  });
  return (
    <StyledRow>
      {items.map((item, index) =>
        isValidElement(item) ? (
          cloneElement(item as ReactElement<{ flex?: number; minWidth?: string }>, {
            flex: 1,
            minWidth: "40%",
            key:
              (item as ReactElement).key != null ? (item as ReactElement).key : `button-${index}`,
          })
        ) : (
          <Fragment key={`button-${index}`}>{item}</Fragment>
        ),
      )}
    </StyledRow>
  );
}
