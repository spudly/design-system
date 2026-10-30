import type { ReactNode } from "react";
import { Button } from "./Button.js";
import { FormStack } from "./FormStack.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { TextLink } from "./TextLink.js";

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
  onSubmit,
  signInHref,
  legalNotice,
}: SignUpFormProps) {
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <FormStack>
      <TextField
        label="Your name"
        value={displayName}
        onChangeText={onDisplayNameChange}
        accessibilityLabel="Your name"
        onSubmitEditing={submitFromField}
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email"
        onSubmitEditing={submitFromField}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password-new"
        secureTextEntry
        accessibilityLabel="Password"
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button
        variant="primary"
        disabled={loading}
        onPress={onSubmit}
        accessibilityLabel={loading ? "Creating account…" : "Create Account"}
      >
        {loading ? "Creating account…" : "Create Account"}
      </Button>
      {legalNotice}
      {signInHref ? (
        <TextLink textAlign="center" href={signInHref}>
          Already have an account? Sign in
        </TextLink>
      ) : null}
    </FormStack>
  );
}
