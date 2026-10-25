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

export interface ResetPasswordPageProps {
  password: string;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
}

export function ResetPasswordPage({
  password,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
}: ResetPasswordPageProps) {
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <Text variant="heading" marginBottom="$4">
        New password
      </Text>
      <Text color="$textMuted" marginBottom="$8">
        Choose a new password for your account.
      </Text>
      <TextField
        label="New password"
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password-new"
        secureTextEntry
        accessibilityLabel="New password"
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
