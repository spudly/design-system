import { YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * ResetPasswordPage (#126, B3c): the new-password view — the
 * split view half of Eciperay's `ResetPasswordView` (the B2
 * audit's page-view disposition). The app screen keeps the
 * reset token handling and the update mutation; this view
 * renders the form and reports the submit intent.
 *
 * The auth cluster's security rule (issue #126) applies in its
 * sharpest form here: the reset token never crosses the DS
 * boundary at all — it is app-side business logic — and the
 * new password crosses only as a controlled value + change
 * callback, with submission a bare intent.
 */

export type ResetPasswordPageProps = {
  password: string;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
};

export function ResetPasswordPage({
  password,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
}: ResetPasswordPageProps) {
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
        <Text variant="heading">New password</Text>
      </YStack>
      <YStack paddingBottom="$8">
        <Text color="$textMuted">Choose a new password for your account.</Text>
      </YStack>
      <TextField
        label="New password"
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password-new"
        secureTextEntry
        accessibilityLabel="New password"
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button
        variant="primary"
        disabled={loading}
        onPress={onSubmit}
        accessibilityLabel="Update password"
      >
        {loading ? "Updating…" : "Update password"}
      </Button>
    </ScreenContainer>
  );
}
