import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { TextLink } from "../components/TextLink.js";

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
 * view's AuthScreenLayout adapter renders exactly it), the
 * heading is the app view's title, and the loading label swap
 * mirrors the app PrimaryButton adapter: while `loading`, the
 * button disables and reads its pending label.
 */

export type SignInPageProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
  onSignUpPress?: () => void;
  onForgotPasswordPress?: () => void;
};

export function SignInPage({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  loading = false,
  error,
  onSubmit,
  onSignUpPress,
  onForgotPasswordPress,
}: SignInPageProps) {
  // Enter/return in a field submits (#255), mirroring the
  // native-form behavior the retired web views had; while
  // loading the submit button is disabled, so field
  // submission is held the same way.
  const submitFromField = () => {
    if (!loading) {
      onSubmit();
    }
  };
  return (
    <ScreenContainer scrollable={false} variant="auth">
      <YStack paddingBottom="$8">
        <Text variant="heading">Welcome back</Text>
      </YStack>
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
      {onSignUpPress ? (
        <YStack paddingTop="$4">
          <TextLink onPress={onSignUpPress}>Create an account</TextLink>
        </YStack>
      ) : null}
      {onForgotPasswordPress ? (
        <YStack paddingTop="$2">
          <TextLink color={tokens.colors.gray.gray6} onPress={onForgotPasswordPress}>
            Forgot password?
          </TextLink>
        </YStack>
      ) : null}
    </ScreenContainer>
  );
}
