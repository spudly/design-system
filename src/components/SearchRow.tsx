import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledSearchRow = styled(XStack, {
  name: "SearchRow",

  gap: tokens.spacing[2],
  alignItems: "stretch",
});

type StyledSearchRowProps = GetProps<typeof StyledSearchRow>;

export type SearchRowProps = Omit<StyledSearchRowProps, "gap" | "alignItems">;

/**
 * A search field and its action (#119): the catalog search
 * bar's row — the field (given SearchField's `grow`) takes the
 * row's remaining width and the trailing action stretches to
 * the field's height, so the two line up as one bar. The
 * stretch is structural, not cosmetic (eciperay #188): the
 * action's natural height is shorter than the field's, and a
 * row that does not stretch it leaves the bar's controls at
 * two heights. Call sites pass only the field and the action:
 * there are no spacing props, by design. For a field-and-action
 * row whose action keeps its natural height, centered, use
 * FieldRow instead.
 */
export function SearchRow({ ...rest }: SearchRowProps) {
  return <StyledSearchRow {...rest} />;
}
