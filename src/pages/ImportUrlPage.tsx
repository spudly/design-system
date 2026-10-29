import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * ImportUrlPage (#126, B3c): the import-from-URL step — the
 * split view half of Eciperay's `ImportUrlView` (the B2
 * audit's page-view disposition). The step's screen keeps the
 * URL state, the import mutation, and navigation; this view
 * renders the form and reports the submit intent.
 *
 * Controlled, the form idiom: the URL crosses as a value +
 * change callback (the screen reads it at submit), validation
 * stays app-side, and the one presentation rule the app view
 * encodes — no import on a blank URL — is mirrored in the
 * submit's disabled state.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The title is Text's `formTitle`
 * variant (the form-flow title treatment), and the section
 * rhythm is FormScreenLayout's own.
 */

export type ImportUrlPageProps = {
  url: string;
  onUrlChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
};

export function ImportUrlPage({
  url,
  onUrlChange,
  loading = false,
  error,
  onSubmit,
}: ImportUrlPageProps) {
  // Enter in the URL field submits, as the retired web form did —
  // guarded exactly like the Import button (non-blank URL, not
  // already loading), so the two submit paths can never diverge.
  const submitFromField = () => {
    if (url.trim() && !loading) {
      onSubmit();
    }
  };

  return (
    <FormScreenLayout>
      <Text variant="formTitle">Import from URL</Text>
      <TextField
        value={url}
        onChangeText={onUrlChange}
        placeholder="https://example.com/recipe"
        onSubmitEditing={submitFromField}
        returnKeyType="go"
      />
      {error ? <Text variant="error">{error}</Text> : null}
      <Button
        variant="primary"
        disabled={!url.trim() || loading}
        onPress={onSubmit}
        accessibilityLabel="Import"
      >
        {loading ? "Importing…" : "Import"}
      </Button>
    </FormScreenLayout>
  );
}
