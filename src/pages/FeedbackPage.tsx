import { Button } from "../components/Button.js";
import { CheckboxField } from "../components/CheckboxField.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

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
 * the app form.
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
}: FeedbackPageProps) {
  return (
    <ScreenContainer variant="padded">
      <Text variant="title">Feedback</Text>
      <Text variant="hint">
        Share ideas, confusion, or problems. We&apos;ll include session context to help us
        investigate.
      </Text>
      {submitted ? (
        <Text variant="success">Thanks — we got your feedback.</Text>
      ) : (
        <>
          <TextAreaField
            label="What's on your mind?"
            accessibilityLabel="What's on your mind?"
            value={message}
            onChangeText={onMessageChange}
            placeholder="Tell us what happened or what you'd like to see improved."
          />
          <TextField
            label="Email me back (optional)"
            value={replyEmail}
            onChangeText={onReplyEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            accessibilityLabel="Email me back (optional)"
          />
          <CheckboxField label="This is a bug" checked={isBug} onCheckedChange={onIsBugChange} />
          {error ? <Text variant="error">{error}</Text> : null}
          <Button
            variant="primary"
            disabled={submitDisabled || submitting}
            onPress={onSubmit}
            accessibilityLabel="Submit feedback"
          >
            {submitting ? "Submitting…" : "Submit feedback"}
          </Button>
        </>
      )}
    </ScreenContainer>
  );
}
