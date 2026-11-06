import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { BrandLink } from "./BrandLink.js";
import { TextLink } from "./TextLink.js";
import { bannerRoleProps } from "./accessibility.js";

export type DocumentHeaderProps = {
  /** Brand wordmark text (the document surface's own label). */
  brandLabel: string;
  /** The brand's canonical href — the wordmark navigates, so it is a link. */
  brandHref: string;
  /** Sign-in link label. */
  signInLabel: string;
  /** The sign-in route's href — the link navigates, so it is a link. */
  signInHref: string;
};

/**
 * The document frame's header row (#170, extracted for #119): the
 * brand wordmark and the sign-in link at the ends of the row, both
 * real links — this frame's chrome navigates by href (the
 * structured-document surface owns its routes). The row is the
 * document surface's lighter chrome: no band, no wide column —
 * it sits inside the document's own column, where
 * PublicFrameHeader's full-width band would double-frame the
 * page. That weight difference is why both headers ship; what
 * the #119 dedupe unified is the contract and the pieces: the
 * wordmark composes BrandLink (the tranche's first cut
 * hand-rolled a second wordmark as a raw Anchor, in a different
 * treatment) and sign-in is a TextLink href form, exactly the
 * public frame header's shapes.
 *
 * Landmarks (#366): on web this row is the page's `banner`
 * landmark (via `bannerRoleProps`) — LegalDocumentPage renders
 * it as its outermost header chrome; native is unaffected.
 */
export function DocumentHeader({
  brandHref,
  brandLabel,
  signInHref,
  signInLabel,
}: DocumentHeaderProps) {
  return (
    <XStack alignItems="center" justifyContent="space-between" gap="$4" {...bannerRoleProps}>
      <BrandLink label={brandLabel} href={brandHref} />
      <TextLink href={signInHref} fontWeight={tokens.typography.fontWeight.medium}>
        {signInLabel}
      </TextLink>
    </XStack>
  );
}
