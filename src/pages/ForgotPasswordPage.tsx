import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { TextLink } from "../components/TextLink.js";

/**
 * ForgotPasswordPage (#126, B3c): the reset-request view —
 * the split view half of Eciperay's `ForgotPasswordView` (the
 * B2 audit's page-view disposition). The app screen keeps the
 * reset-request mutation and navigation; this view renders
 * the form and reports intents.
 *
 * The auth cluster's security rule (issue #126) applies: the
 * email crosses as a controlled value + change callback,
 * submission is a bare intent, and no credentials logic lives
 * in the DS. The back link renders only when the host wires
 * it, as in the app view.
 */

export type ForgotPasswordPageProps = {
  email: string;
  onEmailChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
  onBackPress?: () => void;
};

export function ForgotPasswordPage({
  email,
  onEmailChange,
  loading = false,
  error,
  onSubmit,
  onBackPress,
}: ForgotPasswordPageProps) {
  // Enter/return in the field submits (#255), mirroring the
  // native-form behavior the retired web view had; while
  // loading the submit button is disabled, so field
  // submission is held the same way.
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <YStack paddingBottom="$4">
        <Text variant="heading">Reset password</Text>
      </YStack>
      <YStack paddingBottom="$8">
        <Text color="$textMuted">We&apos;ll send a reset link to your email.</Text>
      </YStack>
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
      {onBackPress ? (
        <YStack paddingTop="$2">
          <TextLink color={tokens.colors.gray.gray6} onPress={onBackPress}>
            Back to sign in
          </TextLink>
        </YStack>
      ) : null}
    </ScreenContainer>
  );
}
