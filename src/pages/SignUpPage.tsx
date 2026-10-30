import type { ReactNode } from "react";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { SignUpForm } from "../components/SignUpForm.js";
import { Text } from "../components/Text.js";

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
 * position the app view renders it — inside the form's footer
 * block, which SignUpForm (#119) owns; the page composes the
 * heading and the form as the screen's two sections.
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
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the link renders only when the
   * href is provided. */
  signInHref?: string;
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
  signInHref,
  legalNotice,
}: SignUpPageProps) {
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <SectionStack>
        <Text variant="heading">Create account</Text>
        <SignUpForm
          displayName={displayName}
          email={email}
          password={password}
          onDisplayNameChange={onDisplayNameChange}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
          signInHref={signInHref}
          legalNotice={legalNotice}
        />
      </SectionStack>
    </ScreenContainer>
  );
}
