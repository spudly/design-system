import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { BrandLink } from "./BrandLink.js";
import { bannerRoleProps } from "./accessibility.js";
import { COLUMN_MAX_WIDTH } from "./PublicFrameLayout.js";
import { TextLink } from "./TextLink.js";

export type PublicFrameHeaderProps = {
  /** Brand wordmark text (the frame's DS-owned copy, passed in). */
  brandLabel: string;
  /** The brand's href — the wordmark navigates home, so it is a link. */
  brandHref: string;
  /** Sign-in link label (the frame's DS-owned copy, passed in). */
  signInLabel: string;
  /** The sign-in route's href — sign-in navigates, so it is a link. */
  signInHref: string;
};

/**
 * The public frame's header band (#119): a surface band with a
 * hairline bottom border, holding the brand wordmark and the
 * sign-in link at the ends of the wide public column
 * (COLUMN_MAX_WIDTH). Extracted from PublicPageFrame for the
 * #119 page de-styling program — the band's fill, border, column
 * geometry, and link treatments are the frame's design, owned
 * here; the copy crosses as props.
 *
 * Both controls are links with hrefs (#119 dedupe, cluster
 * B7): the wordmark composes BrandLink and sign-in is a
 * TextLink href form. The tranche's first cut crossed sign-in
 * as an intent callback (the #169 frame contract) while the
 * document surface's header (DocumentHeader) crossed the same
 * control as an href — two contracts for one job. #248's
 * navigation rule settles it: a control that navigates to
 * another page is a link with an href, so the canonical
 * contract is hrefs in, on both surfaces.
 *
 * Landmarks (#366): on web this band is the page's `banner`
 * landmark (via `bannerRoleProps`); native is unaffected.
 */
export function PublicFrameHeader({
  brandLabel,
  brandHref,
  signInLabel,
  signInHref,
}: PublicFrameHeaderProps) {
  return (
    <YStack
      backgroundColor="$surface"
      borderBottomWidth={1}
      borderColor={tokens.colors.gray.gray2}
      {...bannerRoleProps}
    >
      <XStack
        width="100%"
        maxWidth={COLUMN_MAX_WIDTH}
        alignSelf="center"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$6"
        paddingVertical="$4"
      >
        <BrandLink label={brandLabel} href={brandHref} />
        <TextLink fontSize={tokens.typography.fontSize.sm} href={signInHref}>
          {signInLabel}
        </TextLink>
      </XStack>
    </YStack>
  );
}
