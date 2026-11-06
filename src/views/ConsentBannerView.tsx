import { FixedActionBanner } from "../components/FixedActionBanner.js";
import { TextLink } from "../components/TextLink.js";

export type ConsentBannerViewProps = {
  /** The message up to the policy link. */
  messageBeforeLink: string;
  linkLabel: string;
  /** The privacy policy destination (#248: an href, not a callback). */
  linkHref: string;
  /** The message after the link ("" when the link ends the sentence). */
  messageAfterLink?: string;
  onAccept: () => void;
  onDecline: () => void;
  acceptLabel?: string;
  declineLabel?: string;
};

/**
 * ConsentBannerView (#438 Part 3): the cookie / analytics
 * consent banner as a view — the FixedActionBanner with its
 * message composed from text around an inline privacy-policy
 * link and Decline / Accept actions — so hosts no longer
 * import FixedActionBanner / Text / TextLink to build the
 * banner themselves (the eciperay audit's coverage
 * disposition for those specifiers).
 *
 * The consent record and its side effects stay with the host;
 * the view reports the two intents. Container semantics (the
 * host's dialog role and label for the banner region) stay
 * with the host's own wrapper element, which needs no DS
 * imports. The policy link is a real link with an href: it
 * navigates (#248).
 */
export function ConsentBannerView({
  messageBeforeLink,
  linkLabel,
  linkHref,
  messageAfterLink = "",
  onAccept,
  onDecline,
  acceptLabel = "Accept",
  declineLabel = "Decline",
}: ConsentBannerViewProps) {
  return (
    <FixedActionBanner
      message={
        <>
          {messageBeforeLink} <TextLink href={linkHref}>{linkLabel}</TextLink>
          {messageAfterLink}
        </>
      }
      secondaryAction={{ label: declineLabel, onPress: onDecline }}
      primaryAction={{ label: acceptLabel, onPress: onAccept }}
    />
  );
}
