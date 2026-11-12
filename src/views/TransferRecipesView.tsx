import { YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
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
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, the hint renders as a text
   * skeleton at its own (md) size, the nested export picker
   * receives the loading state (its own `loading` prop still
   * applies on its own), the Import action stays rendered
   * inside the card's loading scope so the Button renders as
   * a rectangle skeleton at its normal geometry, and the
   * import summary and error lines are hidden. An enclosing
   * composite's LoadingScope can also put the view into this
   * state without prop-drilling. */
  loading?: boolean;
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
  loading = false,
}: TransferRecipesViewProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <SectionCard title={title} variant="elevated" loading={showSkeleton}>
      <YStack gap="$3">
        {showSkeleton ? (
          // The hint bone takes the two lines the hint copy
          // wraps to at the section's width — a single line
          // left everything below it shifted up by a line
          // (Stephen on #579).
          <TextSkeleton size="md" lines={2} />
        ) : (
          <Text variant="muted">{hint}</Text>
        )}
        <RecipeExportPickerView
          {...exportPicker}
          loading={showSkeleton || exportPicker.loading === true}
        />
        <Button variant="secondary" disabled={importPending} onPress={onImportPress}>
          {importPending ? importPendingLabel : importLabel}
        </Button>
        {importSummary && !showSkeleton ? <Text variant="success">{importSummary}</Text> : null}
        {error && !showSkeleton ? <Text variant="error">{error}</Text> : null}
      </YStack>
    </SectionCard>
  );
}
