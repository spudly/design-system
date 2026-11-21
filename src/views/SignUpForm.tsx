import { FormStack } from "../widgets/FormStack.js";
import { AuthFormSubmit, type EmailPasswordFormProps } from "./AuthFormSubmit.js";
import { TextField } from "../widgets/form/TextField.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { useVoice } from "../voice/index.js";

/**
 * SignUpForm (#119): the create-account form — the fields and
 * their handling as one component, extracted from SignUpPage
 * so the page composes sections while the form owns its
 * layout (the field rhythm, the error line's place above the
 * submit button, and the footer block's alignment).
 *
 * The auth cluster's security rule (issue #126) applies as it
 * did in the page: credentials cross as controlled values +
 * change callbacks, submission is a bare intent, and no
 * credentials logic lives here.
 *
 * Enter/return in a field submits (#255), mirroring the
 * native-form behavior the retired web views had; while
 * loading the submit button is disabled, so field submission
 * is held the same way.
 *
 * The footer block under the submit button is consistently
 * centered (eciperay#294): the legal notice renders centered
 * from the `legalNotice` copy data (#686 — the legal text and
 * its link destinations stay app-owned as data; only the
 * rendering lives here), and the sign-in link that follows it
 * carries the same centered alignment, so the block reads as
 * one column.
 */

/** One span of the sign-up legal notice (#686): plain text, or
 * a link whose label and href are app-supplied data (the
 * LegalDocumentPage span precedent). The notice's text is
 * never re-authored by the DS — spans cross verbatim. */
export type SignUpLegalNoticeSpan =
  | { type: "text"; text: string }
  | { type: "link"; label: string; href: string };

export type SignUpFormProps = EmailPasswordFormProps & {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  /** The sign-in destination (#248: navigation crosses as an
   * href, not a press callback); the link renders only when
   * the href is provided. */
  signInHref?: string | undefined;
  /** The inline legal notice as copy data (#686): an ordered
   * run of text/link spans the form renders itself, centered,
   * under the submit button. */
  legalNotice?: SignUpLegalNoticeSpan[] | undefined;
};

export function SignUpForm({
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
}: SignUpFormProps) {
  const voice = useVoice();
  const submitLabel = loading ? voice.signUpForm.submitPendingLabel : voice.signUpForm.submitLabel;
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <FormStack>
      <TextField
        label={voice.signUpForm.nameLabel}
        value={displayName}
        onChangeText={onDisplayNameChange}
        accessibilityLabel={voice.signUpForm.nameLabel}
        onSubmitEditing={submitFromField}
      />
      <TextField
        label={voice.signUpForm.emailLabel}
        value={email}
        onChangeText={onEmailChange}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel={voice.signUpForm.emailLabel}
        {...(emailError ? { error: emailError } : {})}
        onSubmitEditing={submitFromField}
      />
      <TextField
        label={voice.signUpForm.passwordLabel}
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password-new"
        secureTextEntry
        accessibilityLabel={voice.signUpForm.passwordLabel}
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      <AuthFormSubmit
        error={error}
        loading={loading}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
      />
      {legalNotice ? (
        <Text textAlign="center" variant="hint">
          {legalNotice.map((span, index) =>
            span.type === "link" ? (
              <TextLink key={index} href={span.href}>
                {span.label}
              </TextLink>
            ) : (
              span.text
            ),
          )}
        </Text>
      ) : null}
      {signInHref ? (
        <TextLink textAlign="center" href={signInHref}>
          {voice.signUpForm.signInLabel}
        </TextLink>
      ) : null}
    </FormStack>
  );
}
