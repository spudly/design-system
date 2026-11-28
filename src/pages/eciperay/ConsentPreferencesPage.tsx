import { BigFooterShell, type BigFooterData, type BigFooterShellHeader } from "../../widgets/content/BigFooter.js";
import { Button } from "../../widgets/actions/Button.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { useVoice } from "../../voice/index.js";

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
 *
 * Loading (#874, following the #278 pattern): while
 * `loading`, the section card renders in its loading state —
 * description and current-choice lines as bones, and the
 * three actions as inert skeleton buttons — so the host can
 * mount the page before the recorded choice resolves instead
 * of gating on a spinner. No recorded choice renders in this
 * state.
 */
export type ConsentPreferencesPageChoice = "accepted" | "declined" | null;

export type ConsentPreferencesPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** The page header data (#857): when supplied, the shell renders the full AppTopBar above the content. */
  header?: BigFooterShellHeader;
  currentChoice: ConsentPreferencesPageChoice;
  /** Loading state (#874): the section renders its skeleton
   * (see the header's loading note); `currentChoice` does not
   * render in this state. */
  loading?: boolean;
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
  header,
  loading = false,
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
  if (loading) {
    return (
      <BigFooterShell footer={footer} header={header}>
        <ScreenContainer variant="padded">
          <SectionCard title={voice.consentPreferencesPage.title} variant="elevated" loading>
            <Col gap="xxl">
              <TextSkeleton size="md" lines={3} />
              <ButtonRow>
                <Button variant="primary" onPress={() => { /* noop */ }}>
                  {voice.consentPreferencesPage.acceptLabel}
                </Button>
                <Button variant="secondary" onPress={() => { /* noop */ }}>
                  {voice.consentPreferencesPage.declineLabel}
                </Button>
                <Button variant="secondary" onPress={() => { /* noop */ }}>
                  {voice.consentPreferencesPage.withdrawLabel}
                </Button>
              </ButtonRow>
              <TextSkeleton size="sm" lines={1} />
            </Col>
          </SectionCard>
        </ScreenContainer>
      </BigFooterShell>
    );
  }
  return (
    <BigFooterShell footer={footer} header={header}>
      <ScreenContainer variant="padded">
        <SectionCard title={voice.consentPreferencesPage.title} variant="elevated">
          <Col gap="xxl">
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
          </Col>
        </SectionCard>
      </ScreenContainer>
    </BigFooterShell>
  );
}
