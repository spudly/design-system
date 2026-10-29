import { Anchor, XStack } from "tamagui";
import { tokens } from "../tokens/index.js";

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
 * real anchors — this frame's chrome navigates by href (the
 * structured-document surface owns its routes), unlike the public
 * frame's intent-callback chrome (PublicFrameHeader, #169). The
 * treatments (the wordmark's size and weight, the sign-in link's
 * link ink) are the frame's design, owned here; the labels and
 * hrefs are the host's content, passed in.
 */
export function DocumentHeader({
  brandHref,
  brandLabel,
  signInHref,
  signInLabel,
}: DocumentHeaderProps) {
  return (
    <XStack alignItems="center" justifyContent="space-between" gap="$4">
      <Anchor
        href={brandHref}
        fontSize={tokens.typography.fontSize.lg}
        fontWeight={tokens.typography.fontWeight.bold}
      >
        {brandLabel}
      </Anchor>
      <Anchor href={signInHref} color="$link" fontWeight={tokens.typography.fontWeight.medium}>
        {signInLabel}
      </Anchor>
    </XStack>
  );
}
