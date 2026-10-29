import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledSearchControls = styled(XStack, {
  name: "SearchControls",

  gap: tokens.spacing[2],
  alignItems: "center",
});

type StyledSearchControlsProps = GetProps<typeof StyledSearchControls>;

export type SearchControlsProps = Omit<StyledSearchControlsProps, "gap" | "alignItems">;

/**
 * A search field with its submit button (#119): the controls of
 * a search page composed on one line — the field (given
 * SearchField's `grow`) takes the row's remaining width, the
 * button keeps its natural width, and the two are vertically
 * centered on each other with an 8px gap. Call sites pass only
 * the field and the button: there are no spacing props, by
 * design.
 */
export function SearchControls({ ...rest }: SearchControlsProps) {
  return <StyledSearchControls {...rest} />;
}
