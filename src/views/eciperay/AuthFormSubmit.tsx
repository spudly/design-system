import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";

/**
 * The credential-field props shared by SignInForm and SignUpForm
 * (#587 phase 3): the controlled email/password values and their
 * change callbacks, the loading/error state, the host's
 * field-level email validation error, and the bare submit
 * intent. Each form's own props extend this with its extra
 * fields and destinations.
 */
export type EmailPasswordFormProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  loading?: boolean | undefined;
  error?: string | null | undefined;
  /** The host's field-level email validation error (#535):
   * renders under the email field with the field's error
   * styling, distinct from the form-level `error` alert. */
  emailError?: string | null | undefined;
  onSubmit: () => void;
};

export type AuthFormSubmitProps = {
  /** The form-level error: renders as an error alert above
   * the submit button when set. */
  error?: string | null | undefined;
  /** While loading, the submit button is disabled (the forms'
   * field submission is held the same way). */
  loading?: boolean | undefined;
  onSubmit: () => void;
  /** The submit button's label — also its accessible name;
   * the caller resolves the pending variant while loading. */
  submitLabel: string;
};

/**
 * The form-level error alert + primary submit button shared
 * by the auth forms (ForgotPasswordForm, ResetPasswordForm,
 * SignInForm, SignUpForm): each form carried an identical copy
 * of this tail — the error line's place above the submit
 * button is part of the forms' shared rhythm. Extracted for
 * #587 phase 2. Internal helper, not a view component of its
 * own: NOT exported from the views barrel, exercised through
 * the four forms' stories.
 */
export function AuthFormSubmit({
  error,
  loading = false,
  onSubmit,
  submitLabel,
}: AuthFormSubmitProps) {
  return (
    <>
      {error ? <Alert severity="error" message={error} /> : null}
      <Button
        variant="primary"
        disabled={loading}
        onPress={onSubmit}
        accessibilityLabel={submitLabel}
      >
        {submitLabel}
      </Button>
    </>
  );
}
