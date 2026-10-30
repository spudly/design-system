import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";

const StyledScreenShell = styled(YStack, {
  name: "ScreenShell",

  flex: 1,
  backgroundColor: "$surface",
});

type StyledScreenShellProps = GetProps<typeof StyledScreenShell>;

export type ScreenShellProps = Omit<StyledScreenShellProps, "flex" | "backgroundColor">;

/**
 * The fixed-shell screen frame (#119): a full-height,
 * surface-filled column for pages that pin their own chrome (a
 * Toolbar) above a scrolling region (a ScrollRegion) — the
 * shell ScreenContainer cannot be, since it pads and scrolls
 * its content itself. Children compose the shell's structure:
 * typically the pinned chrome, then the scroll region, then any
 * pinned footer.
 */
export function ScreenShell({ ...rest }: ScreenShellProps) {
  return <StyledScreenShell {...rest} />;
}
