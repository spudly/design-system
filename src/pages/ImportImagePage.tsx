import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Alert } from "../widgets/Alert.js";
import { Button } from "../widgets/Button.js";
import { FormScreenLayout } from "../widgets/FormScreenLayout.js";
import { Text } from "../widgets/Text.js";

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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  loading?: boolean;
  error?: string | null;
  onPickCamera?: () => void;
  onPickLibrary?: () => void;
  /**
   * The duplicate-override intent (#438 Part 3): when the
   * import hit an existing recipe and the host offers the
   * "Import anyway" override, it passes this callback and the
   * button renders inside the page's own stack — the host used
   * to compose that one Button itself under the page (the
   * audit's Button coverage row for the import screen). The
   * duplicate detection and the override import stay host-side.
   */
  onImportAnyway?: () => void;
};

export function ImportImagePage({
  loading = false,
  error,
  onPickCamera,
  onPickLibrary,
  onImportAnyway,
  footer,
}: ImportImagePageProps) {
  return (
    <BigFooterShell footer={footer}>
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
        {error ? <Alert severity="error" message={error} /> : null}
        {onImportAnyway ? (
          <Button variant="primary" disabled={loading} onPress={onImportAnyway}>
            Import anyway
          </Button>
        ) : null}
      </FormScreenLayout>
    </BigFooterShell>
  );
}
