import { Children, Fragment, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButtonRow = styled(XStack, {
  name: "ButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
  alignItems: "flex-start",
});

type StyledButtonRowProps = GetProps<typeof StyledButtonRow>;

export type ButtonRowProps = Omit<StyledButtonRowProps, "gap" | "alignItems" | "flexWrap"> & {
  /**
   * When true, the row's buttons share the row's width equally
   * (the treatment EqualButtonRow carried before #475 merged it
   * into ButtonRow): each button grows to an equal share of its
   * line with a 40% minimum width. Default false — buttons keep
   * their natural widths.
   */
  equal?: boolean;
};

/**
 * The minimum width each button in an equal row claims, as a share of
 * the row's width: at 40%, two buttons fit a line as equal halves
 * and a third wraps instead of squeezing the line to thirds — a
 * lone button on a wrapped line then grows to fill that line.
 */
const EQUAL_BUTTON_MIN_WIDTH = "40%";

/**
 * Flatten the row's children into its items: a variant fragment a
 * caller wraps its buttons in contributes its own children, and
 * the child forms that render nothing (null, undefined, booleans)
 * drop out. An element lifted out of a fragment is re-keyed with
 * the fragment's own key (or position) as a scope prefix: two
 * fragments may each hold a child keyed the same, and the
 * flattened list must not carry duplicate keys.
 */
function flattenRowChildren(children: ReactNode): ReactNode[] {
  const items: ReactNode[] = [];
  const push = (node: ReactNode) => {
    if (node === null || node === undefined || typeof node === "boolean") return;
    items.push(node);
  };
  Children.forEach(children, (child, childIndex) => {
    if (isValidElement(child) && child.type === Fragment) {
      const scope = (child as ReactElement).key ?? `fragment-${childIndex}`;
      Children.forEach(
        (child as ReactElement<{ children?: ReactNode }>).props.children,
        (inner, innerIndex) => {
          if (inner === null || inner === undefined || typeof inner === "boolean") return;
          if (isValidElement(inner)) {
            items.push(
              cloneElement(inner as ReactElement, {
                key: `${scope}:${(inner as ReactElement).key ?? innerIndex}`,
              }),
            );
          } else {
            items.push(inner);
          }
        },
      );
    } else {
      push(child);
    }
  });
  return items;
}

/**
 * A row of action buttons (#119): the button bar that follows
 * content — a detail page's primary actions, a card's footer
 * buttons. The component owns the bar's internal treatment: the
 * 12px gap between buttons and wrapping onto the next line at
 * narrow widths instead of overflowing. Separation from the
 * content that precedes the bar is owned by the parent — a
 * section stack's gap, a card's internal gap — never by the bar
 * itself: margin props are abolished in all cases, and a parent
 * that supplies no separation gets a flush bar, by design.
 * Call sites pass only the buttons: there are no spacing props,
 * by design — per-call-site spacing is how page layout drifts.
 *
 * With `equal`, the same bar becomes the call-to-action
 * treatment whose buttons are the content's peers and must read
 * as equals: the row sizes every button itself — each grows to
 * an equal share of its line (flex 1) with a 40% minimum width,
 * so two buttons render as equal halves, three render as two
 * halves over one full-width button, and no button ever shrinks
 * below the floor or wraps its own label to fit. Callers still
 * pass only the buttons: the row sizes its buttons itself, so
 * no call site sizes a button. (This is the treatment
 * EqualButtonRow carried until #475 merged it here; a bar that
 * mixes in fixed-width actions — an icon-only print or share
 * button, say — is a different, mixed-width treatment and keeps
 * its own layout.)
 */
export function ButtonRow({ children, equal = false, ...rest }: ButtonRowProps) {
  if (!equal) {
    return <StyledButtonRow {...rest}>{children}</StyledButtonRow>;
  }
  const items = flattenRowChildren(children);
  return (
    <StyledButtonRow {...rest}>
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
    </StyledButtonRow>
  );
}
