import { YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { FormStack } from "./FormStack.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { TextLink } from "./TextLink.js";

const StyledLinks = styled(YStack, {
  name: "SignInFormLinks",

  gap: tokens.spacing[2],
});

/**
 * SignInForm (#119): the sign-in form — the fields and their
 * handling as one component, extracted from SignInPage so the
 * page composes sections while the form owns its layout (the
 * field rhythm, the error line's place above the submit
 * button, and the footer links' tighter stack).
 *
 * The auth cluster's security rule (issue #126) applies as it
 * did in the page: credentials cross as controlled values +
 * change callbacks, submission is a bare intent, and no
 * credentials logic lives here — validation, the auth call,
 * and error mapping are the host's; the host's error crosses
 * back as a string.
 *
 * Enter/return in a field submits (#255), mirroring the
 * native-form behavior the retired web views had; while
 * loading the submit button is disabled, so field submission
 * is held the same way.
 *
 * The footer links are the form's alternate paths: "Create an
 * account" is the primary-weight link, "Forgot password?" the
 * muted one (the app link button's two treatments), stacked
 * tighter than the form's field rhythm, as in the app view.
 */

export type SignInFormProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onSubmit: () => void;
  /** The create-account destination (#248: navigation crosses as
   * an href, not a press callback); the link renders only when
   * the href is provided. */
  signUpHref?: string | undefined;
  /** The forgot-password destination (#248); the link renders
   * only when the href is provided. */
  forgotPasswordHref?: string | undefined;
};

export function SignInForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
  signUpHref,
  forgotPasswordHref,
}: SignInFormProps) {
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <FormStack>
      <TextField
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        autoComplete="email"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email"
        onSubmitEditing={submitFromField}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        autoComplete="password"
        secureTextEntry
        accessibilityLabel="Password"
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button variant="primary" disabled={loading} onPress={onSubmit} accessibilityLabel="Sign In">
        {loading ? "Signing in…" : "Sign In"}
      </Button>
      {signUpHref || forgotPasswordHref ? (
        <StyledLinks>
          {signUpHref ? <TextLink href={signUpHref}>Create an account</TextLink> : null}
          {forgotPasswordHref ? (
            <TextLink tone="muted" href={forgotPasswordHref}>
              Forgot password?
            </TextLink>
          ) : null}
        </StyledLinks>
      ) : null}
    </FormStack>
  );
}
