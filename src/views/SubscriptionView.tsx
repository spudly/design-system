import { YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

export type SubscriptionViewProps = {
  /** Section heading ("Subscription"). */
  title?: string;
  /** The current plan's display name; absent hides the plan line. */
  planLabel?: string | null;
  /** Display-ready status line, composed by the host from its entitlement data. */
  statusText?: string | null;
  /** Shown when there is no status line (the subscribe upsell copy). */
  upsellText?: string | null;
  /** A status refresh is reconciling with the provider. */
  reconcilingText?: string | null;
  error?: string | null;
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, the plan line renders as a text
   * skeleton at xl size (the subheading size) and the status/upsell line at md
   * size, and the manage / refresh / portal actions stay
   * rendered inside the card's loading scope so each Button
   * renders as a rectangle skeleton at its normal geometry
   * (the portal TextLink, which does not read the scope,
   * renders as a text skeleton in its place). No real plan,
   * status, or error text shows. An enclosing composite's
   * LoadingScope can also put the view into this state
   * without prop-drilling. */
  loading?: boolean;
  /** Kept for compatibility with existing hosts: the loading
   * state is now a skeleton (#278), so this text no longer
   * renders as visible text. */
  loadingText?: string;
  onManage?: () => void;
  manageLabel?: string;
  managePendingLabel?: string;
  managePending?: boolean;
  onRefresh?: () => void;
  refreshLabel?: string;
  refreshPendingLabel?: string;
  refreshPending?: boolean;
  /** The provider's customer-portal destination (#248: an href, not a callback). */
  portalUrl?: string | null;
  portalLabel?: string;
};

/**
 * SubscriptionView (#438 Part 3): the profile Subscription
 * section as a view — plan, status, upsell, and the manage /
 * refresh / portal actions on a SectionCard, composed from the
 * shared widgets so hosts no longer import SectionCard / Text
 * / Button / TextLink to build the section themselves (the
 * eciperay audit's coverage disposition for those specifiers).
 *
 * The host derives every string from its entitlement data
 * (plan, status, period end, cancellation) and keeps the
 * checkout / portal sessions and the refresh mutation; the
 * view renders display-ready lines and reports intents. The
 * portal is a real link: it navigates, so it crosses as an
 * href (#248).
 */
export function SubscriptionView({
  title = "Subscription",
  planLabel,
  statusText,
  upsellText,
  reconcilingText,
  error,
  loading = false,
  onManage,
  manageLabel = "Manage subscription",
  managePendingLabel = "Opening…",
  managePending = false,
  onRefresh,
  refreshLabel = "Check again",
  refreshPendingLabel = "Checking…",
  refreshPending = false,
  portalUrl,
  portalLabel = "Open subscription portal",
}: SubscriptionViewProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <SectionCard title={title} variant="elevated" loading={showSkeleton}>
      <YStack gap="$2">
        {showSkeleton ? (
          // Loading (#278): text skeletons mirroring the
          // loaded lines — the plan line at xl size, the
          // status/upsell line at md size. No real plan,
          // status, reconciling, or error text renders.
          <>
            <TextSkeleton size="xl" lines={1} />
            <TextSkeleton size="md" lines={1} />
          </>
        ) : (
          <>
            {planLabel ? <Text variant="subheading">{planLabel}</Text> : null}
            {statusText ? (
              <Text variant="body">{statusText}</Text>
            ) : upsellText ? (
              <Text variant="muted">{upsellText}</Text>
            ) : null}
            {reconcilingText ? <Text variant="muted">{reconcilingText}</Text> : null}
            {error ? <Text variant="error">{error}</Text> : null}
          </>
        )}
        {onManage || onRefresh || portalUrl ? (
          <YStack gap="$2" alignItems="flex-start">
            {onManage ? (
              <Button variant="primary" disabled={managePending} onPress={onManage}>
                {managePending ? managePendingLabel : manageLabel}
              </Button>
            ) : null}
            {onRefresh ? (
              <Button ghost disabled={refreshPending} onPress={onRefresh}>
                {refreshPending ? refreshPendingLabel : refreshLabel}
              </Button>
            ) : null}
            {portalUrl ? (
              showSkeleton ? (
                // TextLink does not read the loading scope,
                // so a text skeleton stands in its place.
                <TextSkeleton size="md" lines={1} />
              ) : (
                <TextLink href={portalUrl}>{portalLabel}</TextLink>
              )
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
