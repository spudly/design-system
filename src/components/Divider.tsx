import { Separator as TamaguiSeparator, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledSeparator = styled(TamaguiSeparator, {
  name: "Divider",

  borderColor: "$borderColor",
});

type StyledSeparatorProps = GetProps<typeof StyledSeparator>;

export interface DividerProps extends StyledSeparatorProps {
  vertical?: boolean;
}

/**
 * Hairline divider for separating list rows and content sections.
 * Pass `vertical` for a vertical rule.
 */
export function Divider({ vertical = false, ...rest }: DividerProps) {
  // Tamagui's vertical Separator sizes to its content height, which is 0 —
  // in a flex row it only becomes visible if it stretches to the row's
  // cross-axis height.
  return (
    <StyledSeparator
      vertical={vertical}
      {...(vertical ? { alignSelf: "stretch" as const } : {})}
      {...rest}
    />
  );
}
