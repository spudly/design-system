import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { Alert } from "../widgets/Alert.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { Button } from "../widgets/Button.js";
import { Center } from "../widgets/Center.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "../widgets/TextSkeleton.js";
import { CheckboxField } from "./CheckboxField.js";
import { useVoice } from "../voice/index.js";

export type FeedbackPreferenceViewProps = {
  /** Section heading. Defaults to the voice object's feedbackPreferenceView title (#539). */
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
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, and the body renders a skeleton
   * branch mirroring the layout — a checkbox row (a 24x24 box
   * bone centered in the field's 44px touch-target slot, with
   * label and description text skeletons), one consent-status
   * text skeleton, and the non-prompt action row with the
   * Accept/Decline ghost Buttons kept inside the loading
   * scope so they render as text bones. No real consent text
   * or values show, and the error is hidden. An enclosing
   * composite's LoadingScope can also put the view into this
   * state without prop-drilling. */
  loading?: boolean;
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
  title: titleProp,
  shortcutLabel: shortcutLabelProp,
  shortcutDescription: shortcutDescriptionProp,
  shortcutEnabled,
  onShortcutEnabledChange,
  shortcutUnavailable = false,
  unavailableHint,
  consent,
  consentStatusText,
  consentPromptOpen = false,
  consentPromptText: consentPromptTextProp,
  onAcceptConsent,
  onDeclineConsent,
  onWithdrawConsent,
  acceptLabel: acceptLabelProp,
  declineLabel: declineLabelProp,
  withdrawLabel: withdrawLabelProp,
  choicesHintBefore: choicesHintBeforeProp,
  choicesLinkLabel: choicesLinkLabelProp,
  choicesHref,
  error,
  loading = false,
}: FeedbackPreferenceViewProps) {
  const voice = useVoice();
  const title = titleProp ?? voice.feedbackPreferenceView.title;
  const shortcutLabel = shortcutLabelProp ?? voice.feedbackPreferenceView.shortcutLabel;
  const shortcutDescription =
    shortcutDescriptionProp ?? voice.feedbackPreferenceView.shortcutDescription;
  const consentPromptText = consentPromptTextProp ?? voice.feedbackPreferenceView.consentPromptText;
  const acceptLabel = acceptLabelProp ?? voice.feedbackPreferenceView.acceptLabel;
  const declineLabel = declineLabelProp ?? voice.feedbackPreferenceView.declineLabel;
  const withdrawLabel = withdrawLabelProp ?? voice.feedbackPreferenceView.withdrawLabel;
  const choicesHintBefore = choicesHintBeforeProp ?? voice.feedbackPreferenceView.choicesHintBefore;
  const choicesLinkLabel = choicesLinkLabelProp ?? voice.feedbackPreferenceView.choicesLinkLabel;
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): a skeleton branch mirroring the loaded
    // layout in the CheckboxField's own geometry — the 24px
    // visual box centered in its 44px touch target, the label
    // and description lines at their own sizes, one status
    // line, and the non-prompt action row's Accept/Decline
    // ghost buttons kept inside the loading scope (ghost
    // buttons render as text bones). No real label, consent
    // text, or error shows.
    return (
      <SectionCard title={title} variant="elevated" loading={showSkeleton}>
        <YStack gap={tokens.spacing[1]}>
          <XStack alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
            <Center width={44} height={44}>
              <BoxSkeleton width={24} height={24} />
            </Center>
            <YStack flex={1} gap={tokens.spacing[1]}>
              {/* The label bone sits centered in the
                  CheckboxField Label's own line box
                  (SIZABLE_TEXT_LINE_BOX, 27), and the
                  description bone takes the two lines the
                  description copy wraps to — the loaded
                  label column is 27 + gap + two lines, and
                  a shorter column slid everything below the
                  row up (Stephen on #579). */}
              <Center height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
                <TextSkeleton size="md" lines={1} />
              </Center>
              <TextSkeleton size="sm" lines={2} />
            </YStack>
          </XStack>
          <YStack gap="$2">
            <TextSkeleton size="md" lines={1} />
            <LoadingScope active>
              <XStack gap="$2" flexWrap="wrap">
                <Button ghost size="sm" onPress={onAcceptConsent}>
                  {acceptLabel}
                </Button>
                <Button ghost size="sm" onPress={onDeclineConsent}>
                  {declineLabel}
                </Button>
              </XStack>
            </LoadingScope>
          </YStack>
        </YStack>
      </SectionCard>
    );
  }
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
                <Button ghost size="sm" onPress={onAcceptConsent}>
                  {acceptLabel}
                </Button>
              ) : null}
              {consent !== false ? (
                <Button ghost size="sm" onPress={onDeclineConsent}>
                  {declineLabel}
                </Button>
              ) : null}
              {consent !== null && onWithdrawConsent ? (
                <Button ghost size="sm" onPress={onWithdrawConsent}>
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
