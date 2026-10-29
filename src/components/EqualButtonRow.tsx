import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledRow = styled(XStack, {
  name: "EqualButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
});

const StyledFrame = styled(YStack, {
  name: "EqualButtonRowFrame",

  flex: 1,
  // Two buttons always share a row; a third wraps instead of
  // shrinking below the readable width.
  minWidth: "40%",
});

export type EqualButtonRowProps = {
  /** The row's buttons. A fragment child is flattened into the
   * row, so a caller can pass a variant's button set as one
   * fragment. */
  children: ReactNode;
};

/**
 * A row of action buttons that share the row's width equally
 * (#119): each button sits in a frame that grows to an equal
 * share of the row with a 40% minimum, so two buttons split a
 * row and further buttons wrap onto the next line at the same
 * width instead of overflowing or hugging their labels — the
 * call-to-action bar treatment PublicRecipePage's CTA card
 * hand-styled onto its Buttons before this component. ButtonRow
 * is the natural-width sibling: it owns the same 12px gap and
 * wrapping, but its buttons keep their content width. Call
 * sites pass only the buttons; the sizing lives here, so no
 * page sizes a button itself.
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
      {items.map((item, index) => (
        <StyledFrame key={isValidElement(item) && item.key != null ? item.key : `button-${index}`}>
          {item}
        </StyledFrame>
      ))}
    </StyledRow>
  );
}
