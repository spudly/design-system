import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledCenter = styled(YStack, {
  name: "Center",

  variants: {
    horizontal: {
      true: { alignItems: "center" },
      false: { alignItems: "stretch" },
    },
    vertical: {
      true: { justifyContent: "center" },
      false: { justifyContent: "flex-start" },
    },
    fill: {
      true: { flex: 1 },
      false: {},
    },
  } as const,

  defaultVariants: {
    horizontal: true,
    vertical: true,
    fill: false,
  },
});

type StyledCenterProps = GetProps<typeof StyledCenter>;

export type CenterProps = Omit<StyledCenterProps, "alignItems" | "justifyContent" | "flex"> & {
  /** Center the child horizontally (default true). */
  horizontal?: boolean;
  /** Center the child vertically within the Center's own
   * height (default true). */
  vertical?: boolean;
  /** Grow to fill the height the parent offers (default
   * false) — the full-area form, e.g. a detail page's loading
   * state filling its shell's content region so the spinner
   * centers on the page, not just within its own height. */
  fill?: boolean;
};

/**
 * Centers a single child (#119): the dedicated centering
 * component — a loading spinner standing in for page content, a
 * lone notice. It wraps ONE child; `horizontal` and `vertical`
 * choose the dimensions to center on, both defaulting to true.
 * Layout stacks are not centering tools: a stack with a single
 * hardcoded child is a sign Center was meant, so stacks do not
 * offer alignment props for this.
 */
export function Center({ horizontal = true, vertical = true, fill = false, ...rest }: CenterProps) {
  return <StyledCenter horizontal={horizontal} vertical={vertical} fill={fill} {...rest} />;
}
