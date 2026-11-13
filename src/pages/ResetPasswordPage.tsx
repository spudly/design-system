import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ResetPasswordForm } from "../views/ResetPasswordForm.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Text } from "../widgets/Text.js";
import { useVoice } from "../voice/index.js";

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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
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
  footer,
}: ResetPasswordPageProps) {
  const voice = useVoice();
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="auth">
        <SectionStack>
          <Text variant="heading">{voice.resetPasswordPage.heading}</Text>
          <Text variant="muted">{voice.resetPasswordPage.description}</Text>
          <ResetPasswordForm
            password={password}
            onPasswordChange={onPasswordChange}
            loading={loading}
            error={error}
            onSubmit={onSubmit}
          />
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
