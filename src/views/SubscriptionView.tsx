import { XStack, YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Spinner } from "../widgets/Spinner.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";

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
  loading?: boolean;
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
  loadingText = "Loading subscription…",
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
  return (
    <SectionCard title={title} variant="elevated">
      <YStack gap="$2">
        {planLabel ? <Text variant="subheading">{planLabel}</Text> : null}
        {statusText ? (
          <Text variant="body">{statusText}</Text>
        ) : upsellText ? (
          <Text variant="muted">{upsellText}</Text>
        ) : null}
        {reconcilingText ? <Text variant="muted">{reconcilingText}</Text> : null}
        {error ? <Text variant="error">{error}</Text> : null}
        {loading ? (
          <XStack gap="$2" alignItems="center">
            <Spinner label={loadingText} />
            <Text variant="muted">{loadingText}</Text>
          </XStack>
        ) : null}
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
            {portalUrl ? <TextLink href={portalUrl}>{portalLabel}</TextLink> : null}
          </YStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
