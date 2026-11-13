import { Alert } from "../widgets/Alert.js";
import type { ReactNode } from "react";
import { Button } from "../widgets/Button.js";
import { FormStack } from "../widgets/FormStack.js";
import { TextField } from "./TextField.js";
import { TextLink } from "../widgets/TextLink.js";
import { useVoice } from "../voice/index.js";

/**
 * SignUpForm (#119): the create-account form — the fields and
 * their handling as one component, extracted from SignUpPage
 * so the page composes sections while the form owns its
 * layout (the field rhythm, the error line's place above the
 * submit button, and the footer block's alignment).
 *
 * The auth cluster's security rule (issue #126) applies as it
 * did in the page: credentials cross as controlled values +
 * change callbacks, submission is a bare intent, and no
 * credentials logic lives here.
 *
 * Enter/return in a field submits (#255), mirroring the
 * native-form behavior the retired web views had; while
 * loading the submit button is disabled, so field submission
 * is held the same way.
 *
 * The footer block under the submit button is consistently
 * centered (eciperay#294): the host renders its legal notice
 * centered into the `legalNotice` slot (the legal copy's
 * links are app content — the URLs are app constants), and
 * the sign-in link that follows it carries the same centered
 * alignment, so the block reads as one column.
 */

export type SignUpFormProps = {
  displayName: string;
  email: string;
  password: string;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  /** The host's field-level email validation error (#535):
   * renders under the email field with the field's error
   * styling, distinct from the form-level `error` alert. */
  emailError?: string | null | undefined;
  onSubmit: () => void;
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the link renders only when
   * the href is provided. */
  signInHref?: string | undefined;
  /** The app's inline legal notice (app LegalLinks). */
  legalNotice?: ReactNode;
};

export function SignUpForm({
  displayName,
  email,
  password,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  loading = false,
  error,
  emailError,
  onSubmit,
  signInHref,
  legalNotice,
}: SignUpFormProps) {
  const voice = useVoice();
  const submitLabel = loading ? voice.signUpForm.submitPendingLabel : voice.signUpForm.submitLabel;
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <FormStack>
      <TextField
        label={voice.signUpForm.nameLabel}
        value={displayName}
        onChangeText={onDisplayNameChange}
        accessibilityLabel={voice.signUpForm.nameLabel}
        onSubmitEditing={submitFromField}
      />
      <TextField
        label={voice.signUpForm.emailLabel}
        value={email}
        onChangeText={onEmailChange}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel={voice.signUpForm.emailLabel}
        {...(emailError ? { error: emailError } : {})}
        onSubmitEditing={submitFromField}
      />
      <TextField
        label={voice.signUpForm.passwordLabel}
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password-new"
        secureTextEntry
        accessibilityLabel={voice.signUpForm.passwordLabel}
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Alert severity="error" message={error} /> : null}
      <Button
        variant="primary"
        disabled={loading}
        onPress={onSubmit}
        accessibilityLabel={submitLabel}
      >
        {submitLabel}
      </Button>
      {legalNotice}
      {signInHref ? (
        <TextLink textAlign="center" href={signInHref}>
          {voice.signUpForm.signInLabel}
        </TextLink>
      ) : null}
    </FormStack>
  );
}
