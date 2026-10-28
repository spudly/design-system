import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
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
      <Text
        variant="heading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Feedback
      </Text>
      <Text color="$textMuted" marginBottom="$6" fontSize={tokens.typography.fontSize.sm}>
        Share ideas, confusion, or problems. We&apos;ll include session context to help us
        investigate.
      </Text>
      {submitted ? (
        <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.success.success8}>
          Thanks — we got your feedback.
        </Text>
      ) : (
        <YStack gap="$4">
          <YStack gap="$2">
            <Text
              fontSize={tokens.typography.fontSize.sm}
              fontWeight={tokens.typography.fontWeight.medium}
              color={tokens.colors.gray.gray10}
            >
              What&apos;s on your mind?
            </Text>
            <TextAreaField
              value={message}
              onChangeText={onMessageChange}
              placeholder="Tell us what happened or what you'd like to see improved."
            />
          </YStack>
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
        </YStack>
      )}
    </ScreenContainer>
  );
}
