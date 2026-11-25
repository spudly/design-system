import { Alert } from "../feedback/Alert.js";

export type FieldErrorProps = {
  /** The validation error text. */
  error: string;
  /**
   * The deterministic error id (`${fieldId}-error`) the owning
   * control points its `aria-describedby` at. Optional only for
   * hosts (LabeledField) that may not know the field's id.
   */
  id?: string | undefined;
};

/**
 * The ONE error rendering for every form control (#804, Stephen's
 * 2026-11-24 amendment): the field's error surfaces through the
 * design system's Alert at `error` severity — the treatment
 * ColorPickerField already used — instead of per-control inline
 * error text. Alert's error severity carries
 * `accessibilityRole="alert"` (assertive on web and native alike),
 * so every control announces its error the same way, and the
 * message meaning is carried by the text, never color alone.
 * Internal helper, not exported from the widgets barrel: controls
 * render it below their interactive element, wired with
 * `aria-invalid` + `aria-describedby` pointing at its id.
 */
export function FieldError({ error, id }: FieldErrorProps) {
  return <Alert severity="error" message={error} {...(id ? { id } : {})} />;
}
