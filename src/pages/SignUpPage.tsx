import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { TextLink } from "../components/TextLink.js";

/**
 * SignUpPage (#126, B3c): the create-account view — the split
 * view half of Eciperay's `SignUpView` (the B2 audit's
 * page-view disposition). The app screen keeps the auth
 * session, the sign-up mutation, and navigation; this view
 * renders the form and reports intents.
 *
 * The auth cluster's security rule (issue #126) applies as on
 * SignInPage: credentials cross as controlled values + change
 * callbacks, submission is a bare intent, and no credentials
 * logic lives in the DS.
 *
 * The legal notice under the submit button is a slot: the
 * legal copy's links are app content (the URLs are app
 * constants — the B2 audit keeps `LegalLinks` app-side), so
 * the host renders its LegalLinks into `legalNotice`, at the
 * position the app view renders it.
 */

export type SignUpPageProps = {
  displayName: string;
  email: string;
  password: string;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
  onSignInPress?: () => void;
  /** The app's inline legal notice (app LegalLinks). */
  legalNotice?: ReactNode;
};

export function SignUpPage({
  displayName,
  email,
  password,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
  onSignInPress,
  legalNotice,
}: SignUpPageProps) {
  // Enter/return in a field submits (#255), mirroring the
  // native-form behavior the retired web views had; while
  // loading the submit button is disabled, so field
  // submission is held the same way.
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <YStack paddingBottom="$8">
        <Text variant="heading">Create account</Text>
      </YStack>
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
        accessibilityLabel="Create Account"
      >
        {loading ? "Creating account…" : "Create Account"}
      </Button>
      {legalNotice}
      {onSignInPress ? (
        <YStack paddingTop="$4">
          <TextLink textAlign="center" onPress={onSignInPress}>
            Already have an account? Sign in
          </TextLink>
        </YStack>
      ) : null}
    </ScreenContainer>
  );
}
