import { YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { TextLink } from "./TextLink.js";

const StyledForm = styled(YStack, {
  name: "ForgotPasswordForm",

  gap: tokens.spacing[4],
});

/**
 * ForgotPasswordForm (#119): the reset-request form — the
 * field and its handling as one component, extracted from
 * ForgotPasswordPage so the page composes sections while the
 * form owns its layout (the field rhythm, the error line's
 * place above the submit button, and the back link below it).
 *
 * The auth cluster's security rule (issue #126) applies as it
 * did in the page: the email crosses as a controlled value +
 * change callback, submission is a bare intent, and no
 * credentials logic lives here. The back link renders only
 * when the host wires it, as in the app view, in the muted
 * link treatment (the app link button's muted variant).
 *
 * Enter/return in the field submits (#255), mirroring the
 * native-form behavior the retired web view had; while
 * loading the submit button is disabled, so field submission
 * is held the same way.
 */

export type ForgotPasswordFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onSubmit: () => void;
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the "Back to sign in" link
   * renders only when the href is provided. */
  signInHref?: string | undefined;
};

export function ForgotPasswordForm({
  email,
  onEmailChange,
  loading = false,
  error,
  onSubmit,
  signInHref,
}: ForgotPasswordFormProps) {
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <StyledForm>
      <TextField
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email"
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button
        variant="primary"
        disabled={loading}
        onPress={onSubmit}
        accessibilityLabel="Send Reset Link"
      >
        {loading ? "Sending…" : "Send Reset Link"}
      </Button>
      {signInHref ? (
        <TextLink tone="muted" href={signInHref}>
          Back to sign in
        </TextLink>
      ) : null}
    </StyledForm>
  );
}
