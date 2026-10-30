import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";

/**
 * ImportImagePage (#126, B3c): the import-from-image step —
 * the split view half of Eciperay's `ImportImageView` (the B2
 * audit's page-view disposition). Both buttons are bare
 * intents: the camera/library picker invocation is native
 * business logic and stays app-side (the B3a image-picking
 * decision applied to import — the DS receives no picker
 * library and no picked file). The step's screen keeps the
 * pickers, the import mutation, and navigation.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The title is Text's `formTitle`
 * variant, the importing status is the muted `hint`
 * treatment, and the section rhythm is FormScreenLayout's
 * own.
 */

export type ImportImagePageProps = {
  loading?: boolean;
  error?: string | null;
  onPickCamera?: () => void;
  onPickLibrary?: () => void;
};

export function ImportImagePage({
  loading = false,
  error,
  onPickCamera,
  onPickLibrary,
}: ImportImagePageProps) {
  return (
    <FormScreenLayout>
      <Text variant="formTitle">Import from Image</Text>
      <Button
        variant="primary"
        disabled={loading}
        onPress={() => {
          onPickCamera?.();
        }}
        accessibilityLabel="Take Photo"
      >
        Take Photo
      </Button>
      <Button
        variant="secondary"
        disabled={loading}
        onPress={() => {
          onPickLibrary?.();
        }}
      >
        Choose from Library
      </Button>
      {loading ? <Text variant="hint">Importing…</Text> : null}
      {error ? <Text variant="error">{error}</Text> : null}
    </FormScreenLayout>
  );
}
