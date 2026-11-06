import { XStack, YStack } from "tamagui";
import { Alert } from "../widgets/Alert.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { CheckboxField } from "./CheckboxField.js";

export type FeedbackPreferenceViewProps = {
  /** Section heading ("Preferences"). */
  title?: string;
  shortcutLabel?: string;
  shortcutDescription?: string;
  shortcutEnabled: boolean;
  onShortcutEnabledChange: (enabled: boolean) => void;
  /** The shortcut is unavailable (analytics not configured): the checkbox disables. */
  shortcutUnavailable?: boolean;
  unavailableHint?: string | null;
  /** The current consent state; null = not set. Display state — the host owns the consent record. */
  consent: boolean | null;
  /** Display-ready status line ("Analytics consent: Accepted"). */
  consentStatusText?: string | null;
  /** The in-section consent prompt is open (a feature asked for consent). */
  consentPromptOpen?: boolean;
  consentPromptText?: string;
  onAcceptConsent: () => void;
  onDeclineConsent: () => void;
  /** Withdraw renders only when provided (the host passes it while a choice is recorded). */
  onWithdrawConsent?: () => void;
  acceptLabel?: string;
  declineLabel?: string;
  withdrawLabel?: string;
  /** The privacy-choices sentence: text before the link, then the link itself. */
  choicesHintBefore?: string;
  choicesLinkLabel?: string;
  /** The privacy-choices destination (#248: an href, not a callback). */
  choicesHref?: string;
  error?: string | null;
};

/**
 * FeedbackPreferenceView (#438 Part 3): the profile feedback /
 * analytics-consent preference section as a view — the
 * feedback-shortcut checkbox with the consent status, the
 * in-section consent prompt, and the consent actions nested
 * in its children slot, on a SectionCard — composed from the
 * shared widgets and views so hosts no longer import
 * SectionCard / Text / TextLink / Button to build the section
 * themselves (the eciperay audit's coverage disposition for
 * those specifiers).
 *
 * The consent state machine stays with the host (eciperay
 * #256's forced re-consent rule included): the view receives
 * the recorded choice and the prompt's open flag as data and
 * derives only presentation from them — Accept shows while
 * consent is not granted, Decline while it is not declined,
 * Withdraw while a choice is recorded. Every change reports
 * through the callbacks.
 */
export function FeedbackPreferenceView({
  title = "Preferences",
  shortcutLabel = "Show feedback shortcut",
  shortcutDescription = "Adds a floating shortcut for sending feedback from anywhere in the app.",
  shortcutEnabled,
  onShortcutEnabledChange,
  shortcutUnavailable = false,
  unavailableHint,
  consent,
  consentStatusText,
  consentPromptOpen = false,
  consentPromptText = "Share anonymous usage analytics to help improve the app? You can change this any time.",
  onAcceptConsent,
  onDeclineConsent,
  onWithdrawConsent,
  acceptLabel = "Accept",
  declineLabel = "Decline",
  withdrawLabel = "Withdraw consent",
  choicesHintBefore = "Manage your choice at any time on the ",
  choicesLinkLabel = "privacy choices page",
  choicesHref,
  error,
}: FeedbackPreferenceViewProps) {
  return (
    <SectionCard title={title} variant="elevated">
      <CheckboxField
        label={shortcutLabel}
        description={shortcutDescription}
        checked={shortcutEnabled}
        onCheckedChange={onShortcutEnabledChange}
        disabled={shortcutUnavailable}
      >
        <YStack gap="$2">
          {shortcutUnavailable && unavailableHint ? (
            <Text variant="hint">{unavailableHint}</Text>
          ) : null}
          {consentStatusText ? <Text variant="body">{consentStatusText}</Text> : null}
          {consentPromptOpen ? (
            <YStack gap="$2">
              <Text variant="body">{consentPromptText}</Text>
              <XStack gap="$2">
                <Button variant="secondary" size="sm" onPress={onDeclineConsent}>
                  {declineLabel}
                </Button>
                <Button variant="primary" size="sm" onPress={onAcceptConsent}>
                  {acceptLabel}
                </Button>
              </XStack>
            </YStack>
          ) : (
            <XStack gap="$2" flexWrap="wrap">
              {consent !== true ? (
                <Button variant="ghost" size="sm" onPress={onAcceptConsent}>
                  {acceptLabel}
                </Button>
              ) : null}
              {consent !== false ? (
                <Button variant="ghost" size="sm" onPress={onDeclineConsent}>
                  {declineLabel}
                </Button>
              ) : null}
              {consent !== null && onWithdrawConsent ? (
                <Button variant="ghost" size="sm" onPress={onWithdrawConsent}>
                  {withdrawLabel}
                </Button>
              ) : null}
            </XStack>
          )}
          {choicesHref ? (
            <Text variant="hint">
              {choicesHintBefore}
              <TextLink href={choicesHref}>{choicesLinkLabel}</TextLink>.
            </Text>
          ) : null}
          {error ? <Alert severity="error" message={error} /> : null}
        </YStack>
      </CheckboxField>
    </SectionCard>
  );
}
