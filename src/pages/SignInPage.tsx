import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { SignInForm } from "../components/SignInForm.js";
import { Text } from "../components/Text.js";

/**
 * SignInPage (#126, B3c): the sign-in view — the split view half
 * of Eciperay's `SignInView` (the B2 audit's page-view
 * disposition). The app screen keeps the auth session, the
 * sign-in mutation, and navigation; this view renders the form
 * and reports intents.
 *
 * The security rule for the auth cluster (issue #126):
 * credentials cross as controlled values + change callbacks,
 * and submission is a bare intent. No credentials logic lives
 * in the DS — validation, the auth call, and error mapping are
 * the host's; the host's error crosses back as a string and
 * renders above the submit button, as in the app view.
 *
 * The shell is the DS ScreenContainer `auth` variant (the app
 * view's AuthScreenLayout adapter renders exactly it) and the
 * heading is the app view's title. The form itself is
 * SignInForm (#119): the page composes the heading and the
 * form as the screen's two sections (SectionStack's rhythm is
 * the separation the app view's title spacing renders), and
 * the form owns the fields, the submit handling, and the
 * footer links.
 */

export type SignInPageProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
  /** The create-account destination (#248: navigation crosses as
   * an href, not a press callback); the link renders only when
   * the href is provided. */
  signUpHref?: string;
  /** The forgot-password destination (#248); the link renders
   * only when the href is provided. */
  forgotPasswordHref?: string;
};

export function SignInPage({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
  signUpHref,
  forgotPasswordHref,
}: SignInPageProps) {
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <SectionStack>
        <Text variant="heading">Welcome back</Text>
        <SignInForm
          email={email}
          password={password}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
          signUpHref={signUpHref}
          forgotPasswordHref={forgotPasswordHref}
        />
      </SectionStack>
    </ScreenContainer>
  );
}
