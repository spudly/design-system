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
  } as const,

  defaultVariants: {
    horizontal: true,
    vertical: true,
  },
});

type StyledCenterProps = GetProps<typeof StyledCenter>;

export type CenterProps = Omit<StyledCenterProps, "alignItems" | "justifyContent"> & {
  /** Center the child horizontally (default true). */
  horizontal?: boolean;
  /** Center the child vertically within the Center's own
   * height (default true). */
  vertical?: boolean;
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
export function Center({ horizontal = true, vertical = true, ...rest }: CenterProps) {
  return <StyledCenter horizontal={horizontal} vertical={vertical} {...rest} />;
}
