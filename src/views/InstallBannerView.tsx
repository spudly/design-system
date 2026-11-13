import { XStack } from "tamagui";
import { FixedActionBanner } from "../widgets/FixedActionBanner.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { useVoice } from "../voice/index.js";

export type InstallBannerViewLink = {
  label: string;
  /** The store destination (#248: an href, not a callback). */
  href: string;
};

export type InstallBannerViewProps = {
  message: string;
  /** The app-store links rendered inline after the message. */
  links: InstallBannerViewLink[];
  onDismiss: () => void;
  /** Defaults to the voice object's installBannerView dismissLabel (#539). */
  dismissAriaLabel?: string;
};

/**
 * InstallBannerView (#438 Part 3): the mobile-app install
 * banner as a view — the top-pinned FixedActionBanner with
 * its message and inline app-store links and a dismiss
 * action — so hosts no longer import FixedActionBanner /
 * Text / TextLink to build the banner themselves (the
 * eciperay audit's coverage disposition for those specifiers).
 *
 * The store links navigate, so they cross as hrefs (#248);
 * dismissal is a bare intent the host records. Container
 * semantics (the host's region role and label) stay with the
 * host's own wrapper element, which needs no DS imports.
 */
export function InstallBannerView({
  message,
  links,
  onDismiss,
  dismissAriaLabel: dismissAriaLabelProp,
}: InstallBannerViewProps) {
  const voice = useVoice();
  const dismissAriaLabel = dismissAriaLabelProp ?? voice.installBannerView.dismissLabel;
  return (
    <FixedActionBanner
      position="top"
      message={
        <XStack flexWrap="wrap" gap="$2" alignItems="center">
          <Text>{message}</Text>
          {links.map((link) => (
            <TextLink key={link.href} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </XStack>
      }
      onDismiss={onDismiss}
      dismissAriaLabel={dismissAriaLabel}
    />
  );
}
