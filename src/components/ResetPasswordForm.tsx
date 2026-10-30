import { Button } from "./Button.js";
import { FormStack } from "./FormStack.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";

/**
 * ResetPasswordForm (#119): the new-password form — the field
 * and its handling as one component, extracted from
 * ResetPasswordPage so the page composes sections while the
 * form owns its layout (the field rhythm and the error line's
 * place above the submit button).
 *
 * The auth cluster's security rule (issue #126) applies in
 * its sharpest form here, as it did in the page: the reset
 * token never crosses the DS boundary at all — it is app-side
 * business logic — and the new password crosses only as a
 * controlled value + change callback, with submission a bare
 * intent.
 *
 * Enter/return in the field submits (#255), mirroring the
 * native-form behavior the retired web view had; while
 * loading the submit button is disabled, so field submission
 * is held the same way.
 */

export type ResetPasswordFormProps = {
  password: string;
  onPasswordChange: (value: string) => void;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onSubmit: () => void;
};

export function ResetPasswordForm({
  password,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
}: ResetPasswordFormProps) {
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <FormStack>
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
    </FormStack>
  );
}
