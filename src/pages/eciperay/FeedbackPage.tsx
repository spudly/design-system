import { BigFooterShell, type BigFooterData, type BigFooterShellHeader } from "../../widgets/content/BigFooter.js";
import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { CheckboxField } from "../../widgets/form/CheckboxField.js";
import { TextAreaField } from "../../widgets/form/TextAreaField.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Text } from "../../widgets/data/Text.js";
import { TextField } from "../../widgets/form/TextField.js";
import { useVoice } from "../../voice/index.js";

/**
 * FeedbackPage (#126, B3c): the feedback view — the split
 * view halves of Eciperay's `FeedbackView` and `FeedbackForm`
 * (the B2 audit: the page view, hosting the FeedbackForm split
 * — "form view → DS with the Feedback page; analytics submit,
 * auth session, reply-email prefill rules, and validation
 * stay app-side").
 *
 * The form is fully controlled, per-field (value + change
 * callback), and submission is a bare intent. Everything the
 * audit leaves app-side stays in the host: the analytics
 * submission, the session-derived reply-email prefill (an
 * untouched prefill tracks the account; a deliberate edit is
 * preserved), the focus reset, and validation — validation
 * crosses only as its result, the submit button's disabled
 * boolean (`submitDisabled`). The submitted state crosses as
 * a boolean and swaps the form for the thanks message, as in
 * the app form. Cancel (#877) is likewise a bare intent: when
 * the host supplies `onCancel`, a secondary Cancel button sits
 * beside Submit in a ButtonRow; its label is the host's
 * `cancelLabel` prop when given, else the shared
 * `voice.common.cancelLabel`. With no handler the page renders
 * exactly as before, and Cancel is never disabled by
 * `submitting` / `submitDisabled` (the host form's behavior).
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The shell's own section rhythm
 * separates the blocks at the form's field rhythm; the title
 * takes Text's `title` variant (the xl bold treatment it
 * rendered with, owned by the variant), the subtitle the
 * `hint` variant, and the message field takes TextAreaField's
 * own label — the same label treatment the email field's
 * TextField renders, where the page previously hand-rolled a
 * label beside the textarea — with the explicit accessible
 * name the email field carries. The submitted thanks takes
 * the `success` variant (the app form's bare success line).
 */

export type FeedbackPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** The page header data (#857): when supplied, the shell renders the full AppTopBar above the content. */
  header?: BigFooterShellHeader;
  message: string;
  onMessageChange: (value: string) => void;
  replyEmail: string;
  onReplyEmailChange: (value: string) => void;
  isBug: boolean;
  onIsBugChange: (checked: boolean) => void;
  error?: string | null;
  submitting?: boolean;
  submitted?: boolean;
  /** The host's validation result: submit is disabled while true. */
  submitDisabled?: boolean;
  onSubmit: () => void;
  /**
   * Optional cancel intent (#877): when supplied, a secondary
   * Cancel button renders beside Submit and reports this
   * intent. When omitted, no cancel control renders and the
   * page renders exactly as before.
   */
  onCancel?: () => void;
  /** The cancel button's label (#877): wins over the shared `voice.common.cancelLabel` default. */
  cancelLabel?: string;
  /** Optional submitted-state next action (#856): "Send more
   * feedback" — an in-place reset intent that returns to the blank
   * form (a callback, not a link, under #248). When supplied, the
   * submitted success Alert carries it as its action. */
  onResetPress?: () => void;
};

export function FeedbackPage({
  message,
  onMessageChange,
  replyEmail,
  onReplyEmailChange,
  isBug,
  onIsBugChange,
  error,
  submitting = false,
  submitted = false,
  submitDisabled = false,
  onSubmit,
  onCancel,
  cancelLabel: cancelLabelProp,
  onResetPress,
  footer,
  header,
}: FeedbackPageProps) {
  const voice = useVoice();
  const cancelLabel = cancelLabelProp ?? voice.common.cancelLabel;
  return (
    <BigFooterShell footer={footer} header={header}>
      <ScreenContainer variant="padded">
        <Text variant="title">{voice.feedbackPage.title}</Text>
        <Text variant="hint">{voice.feedbackPage.description}</Text>
        {submitted ? (
          <Alert
            severity="success"
            message={voice.feedbackPage.submittedMessage}
            {...(onResetPress
              ? {
                  actions: [
                    { label: voice.feedbackPage.submittedActionLabel, onPress: onResetPress },
                  ],
                }
              : {})}
          />
        ) : (
          <>
            <TextAreaField
              label={voice.feedbackPage.messageLabel}
              accessibilityLabel={voice.feedbackPage.messageLabel}
              value={message}
              onChangeText={onMessageChange}
              placeholder={voice.feedbackPage.messagePlaceholder}
            />
            <TextField
              label={voice.feedbackPage.replyEmailLabel}
              value={replyEmail}
              onChangeText={onReplyEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={voice.feedbackPage.replyEmailPlaceholder}
              accessibilityLabel={voice.feedbackPage.replyEmailLabel}
            />
            <CheckboxField
              label={voice.feedbackPage.bugLabel}
              checked={isBug}
              onCheckedChange={onIsBugChange}
            />
            {error ? <Alert severity="error" message={error} /> : null}
            <ButtonRow>
              {onCancel ? (
                <Button variant="secondary" onPress={onCancel} accessibilityLabel={cancelLabel}>
                  {cancelLabel}
                </Button>
              ) : null}
              <Button
                variant="primary"
                disabled={submitDisabled || submitting}
                onPress={onSubmit}
                accessibilityLabel={voice.feedbackPage.submitLabel}
              >
                {submitting ? voice.feedbackPage.submitPendingLabel : voice.feedbackPage.submitLabel}
              </Button>
            </ButtonRow>
          </>
        )}
      </ScreenContainer>
    </BigFooterShell>
  );
}
