import { ForgotPasswordForm } from "../components/ForgotPasswordForm.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";

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
 *
 * The form itself is ForgotPasswordForm (#119): the page
 * composes the heading, the intro line, and the form as the
 * screen's sections (SectionStack's rhythm carries the
 * separations the app view's title and intro spacing render),
 * and the form owns the field, the submit handling, and the
 * back link.
 */

export type ForgotPasswordPageProps = {
  email: string;
  onEmailChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the "Back to sign in" link
   * renders only when the href is provided. */
  signInHref?: string;
};

export function ForgotPasswordPage({
  email,
  onEmailChange,
  loading = false,
  error,
  onSubmit,
  signInHref,
}: ForgotPasswordPageProps) {
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <SectionStack>
        <Text variant="heading">Reset password</Text>
        <Text variant="muted">We&apos;ll send a reset link to your email.</Text>
        <ForgotPasswordForm
          email={email}
          onEmailChange={onEmailChange}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
          signInHref={signInHref}
        />
      </SectionStack>
    </ScreenContainer>
  );
}
