import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledBannerRow = styled(XStack, {
  name: "BannerRow",

  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.spacing[4],
});

type StyledBannerRowProps = GetProps<typeof StyledBannerRow>;

export type BannerRowProps = Omit<StyledBannerRowProps, "alignItems" | "justifyContent" | "gap">;

/**
 * A banner row (#119): a frame header's two ends — a brand
 * wordmark and a sign-in link, say — centered against each
 * other, pushed to opposite ends of the row, separated by at
 * least the 16px gap. Call sites pass the row's contents and
 * any landmark props (the page passes `bannerRoleProps`):
 * there are no spacing props, by design — the row owns the
 * geometry.
 */
export function BannerRow({ ...rest }: BannerRowProps) {
  return <StyledBannerRow {...rest} />;
}
