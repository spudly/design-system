import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";

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
 * report the user's action. The explanatory copy is generic
 * (the DS-owned-copy precedent) and overridable, because the
 * precise analytics wording is the host's privacy surface;
 * the choices here and the profile's FeedbackPreferenceView
 * act on the same host-held record.
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

const CHOICE_LABELS: Record<"accepted" | "declined", string> = {
  accepted: "Accepted",
  declined: "Declined",
};

const DEFAULT_DESCRIPTION =
  "We use privacy-respecting analytics to understand which features are used and where the app can improve. You can accept or decline at any time, and change your mind whenever you like.";
const DEFAULT_HINT =
  "Withdrawing consent removes your previous choice; you will be asked again the next time a feature needs it.";

export function ConsentPreferencesPage({
  currentChoice,
  onAccept,
  onDecline,
  onWithdraw,
  description = DEFAULT_DESCRIPTION,
  hint = DEFAULT_HINT,
  footer,
}: ConsentPreferencesPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionCard title="Privacy choices" variant="elevated">
          <SectionStack>
            <Text variant="body">{description}</Text>
            <Text variant="body">
              Your current choice: {currentChoice ? CHOICE_LABELS[currentChoice] : "Not set"}
            </Text>
            <ButtonRow>
              <Button variant="primary" onPress={onAccept}>
                Accept
              </Button>
              <Button variant="secondary" onPress={onDecline}>
                Decline
              </Button>
              <Button variant="secondary" onPress={onWithdraw}>
                Withdraw
              </Button>
            </ButtonRow>
            <Text variant="hint">{hint}</Text>
          </SectionStack>
        </SectionCard>
      </ScreenContainer>
    </BigFooterShell>
  );
}
