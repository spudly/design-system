import { YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import {
  RecipeExportPickerView,
  type RecipeExportPickerViewProps,
} from "./RecipeExportPickerView.js";

export type TransferRecipesViewProps = {
  /** Section heading ("Transfer recipes"). */
  title?: string;
  /** The section's explanatory line. */
  hint?: string;
  /** The export picker's props, composed by the host. */
  exportPicker: RecipeExportPickerViewProps;
  /**
   * The import intent: the host owns the file picking itself
   * (a hidden file input on web, the platform picker on
   * native) and runs the import; the button reports the press.
   */
  onImportPress: () => void;
  importLabel?: string;
  importPendingLabel?: string;
  importPending?: boolean;
  /** The last import's outcome line. */
  importSummary?: string | null;
  error?: string | null;
};

/**
 * TransferRecipesView (#438 Part 3): the profile "Transfer
 * recipes" section as a view — the export picker over the
 * import action on a SectionCard, composed from the shared
 * widgets and the RecipeExportPickerView so hosts no longer
 * import SectionCard / Text / Button to build the section
 * themselves (the eciperay audit's coverage disposition for
 * those specifiers).
 *
 * The import's file mechanics stay with the host: the view's
 * button reports the press and the host opens its picker and
 * runs the import, reporting the outcome back as the summary
 * and error lines.
 */
export function TransferRecipesView({
  title = "Transfer recipes",
  hint = "Export recipes to a file you can keep, or import recipes from a file.",
  exportPicker,
  onImportPress,
  importLabel = "Import recipes",
  importPendingLabel = "Importing…",
  importPending = false,
  importSummary,
  error,
}: TransferRecipesViewProps) {
  return (
    <SectionCard title={title} variant="elevated">
      <YStack gap="$3">
        <Text variant="muted">{hint}</Text>
        <RecipeExportPickerView {...exportPicker} />
        <Button variant="secondary" disabled={importPending} onPress={onImportPress}>
          {importPending ? importPendingLabel : importLabel}
        </Button>
        {importSummary ? <Text variant="success">{importSummary}</Text> : null}
        {error ? <Text variant="error">{error}</Text> : null}
      </YStack>
    </SectionCard>
  );
}
