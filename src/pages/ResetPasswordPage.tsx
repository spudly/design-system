import { ResetPasswordForm } from "../components/ResetPasswordForm.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";

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
 *
 * The form itself is ResetPasswordForm (#119): the page
 * composes the heading, the intro line, and the form as the
 * screen's sections (SectionStack's rhythm carries the
 * separations the app view's title and intro spacing render),
 * and the form owns the field and the submit handling.
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
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <SectionStack>
        <Text variant="heading">New password</Text>
        <Text variant="muted">Choose a new password for your account.</Text>
        <ResetPasswordForm
          password={password}
          onPasswordChange={onPasswordChange}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
        />
      </SectionStack>
    </ScreenContainer>
  );
}
