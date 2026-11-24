import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { SectionStack } from "../../widgets/layout/SectionStack.js";
import { SignUpForm, type SignUpLegalNoticeSpan } from "../../views/eciperay/SignUpForm.js";
import { Text } from "../../widgets/data/Text.js";
import { useVoice } from "../../voice/index.js";

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
 * The legal notice under the submit button is copy data
 * (#686): the legal text and its link destinations stay
 * app-owned, supplied as text/link spans through
 * `legalNotice`, and SignUpForm renders it at the position
 * the app view renders it — inside the form's footer block,
 * which SignUpForm (#119) owns; the page composes the
 * heading and the form as the screen's two sections.
 */

export type SignUpPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  displayName: string;
  email: string;
  password: string;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  /** The host's field-level email validation error (#535):
   * renders under the email field with the field's error
   * styling, distinct from the form-level `error` alert. */
  emailError?: string | null;
  onSubmit: () => void;
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the link renders only when the
   * href is provided. */
  signInHref?: string;
  /** The inline legal notice as copy data (#686): text/link
   * spans, rendered by the form under the submit button. */
  legalNotice?: SignUpLegalNoticeSpan[];
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
  emailError,
  onSubmit,
  signInHref,
  legalNotice,
  footer,
}: SignUpPageProps) {
  const voice = useVoice();
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="auth">
        <SectionStack>
          <Text variant="heading">{voice.signUpPage.heading}</Text>
          <SignUpForm
            displayName={displayName}
            email={email}
            password={password}
            onDisplayNameChange={onDisplayNameChange}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            loading={loading}
            error={error}
            emailError={emailError}
            onSubmit={onSubmit}
            signInHref={signInHref}
            legalNotice={legalNotice}
          />
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
