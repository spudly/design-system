import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Button } from "../widgets/Button.js";
import { ButtonRow } from "../widgets/ButtonRow.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Text } from "../widgets/Text.js";
import { useVoice } from "../voice/index.js";

/**
 * ConsentPreferencesPage (#438 Part 3): the standalone
 * privacy-choices page — the recorded analytics-consent
 * choice with its accept / decline / withdraw actions — as a
 * page, so hosts no longer compose ScreenContainer /
 * SectionCard / Text / Button for it themselves (the eciperay
 * audit's coverage disposition for those specifiers).
 *
 * The consent record and its side effects stay with the host:
 * the current choice crosses as data and the three intents
 * report the user's action. The copy comes from the voice
 * object (#539); the explanatory lines stay overridable by
 * prop, because the precise analytics wording is the host's
 * privacy surface; the choices here and the profile's
 * FeedbackPreferenceView act on the same host-held record.
 */
export type ConsentPreferencesPageChoice = "accepted" | "declined" | null;

export type ConsentPreferencesPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  currentChoice: ConsentPreferencesPageChoice;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
  description?: string;
  hint?: string;
};

export function ConsentPreferencesPage({
  currentChoice,
  onAccept,
  onDecline,
  onWithdraw,
  description: descriptionProp,
  hint: hintProp,
  footer,
}: ConsentPreferencesPageProps) {
  const voice = useVoice();
  const description = descriptionProp ?? voice.consentPreferencesPage.description;
  const hint = hintProp ?? voice.consentPreferencesPage.hint;
  const choiceLabel =
    currentChoice === "accepted"
      ? voice.consentPreferencesPage.acceptedLabel
      : currentChoice === "declined"
        ? voice.consentPreferencesPage.declinedLabel
        : voice.consentPreferencesPage.notSetLabel;
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionCard title={voice.consentPreferencesPage.title} variant="elevated">
          <SectionStack>
            <Text variant="body">{description}</Text>
            <Text variant="body">
              {voice.consentPreferencesPage.currentChoiceLabel}
              {choiceLabel}
            </Text>
            <ButtonRow>
              <Button variant="primary" onPress={onAccept}>
                {voice.consentPreferencesPage.acceptLabel}
              </Button>
              <Button variant="secondary" onPress={onDecline}>
                {voice.consentPreferencesPage.declineLabel}
              </Button>
              <Button variant="secondary" onPress={onWithdraw}>
                {voice.consentPreferencesPage.withdrawLabel}
              </Button>
            </ButtonRow>
            <Text variant="hint">{hint}</Text>
          </SectionStack>
        </SectionCard>
      </ScreenContainer>
    </BigFooterShell>
  );
}
