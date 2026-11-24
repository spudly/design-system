import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { Button } from "../../widgets/actions/Button.js";
import { CompactRow } from "../../widgets/layout/CompactRow.js";
import { ContentStack } from "../../widgets/layout/ContentStack.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { SectionMutedText } from "./SectionMutedText.js";
import { useVoice } from "../../voice/index.js";

export type AccountDataViewProps = {
  /** Section heading. Defaults to the voice object's accountDataView title (#539). */
  title?: string;
  /** The section's explanatory line. */
  description?: string;
  onExportData?: () => void;
  exportLabel?: string;
  exportPendingLabel?: string;
  exportPending?: boolean;
  onDeleteAccount?: () => void;
  deleteLabel?: string;
  deletePendingLabel?: string;
  deletePending?: boolean;
  error?: string | null;
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, the description renders as a text
   * skeleton at its own (md) size, and the export/delete
   * actions stay rendered inside the card's loading scope so
   * each Button renders as a rectangle skeleton at its normal
   * geometry; the error line is hidden. An enclosing
   * composite's LoadingScope can also put the view into this
   * state without prop-drilling. */
  loading?: boolean;
};

/**
 * AccountDataView (#438 Part 3): the profile "Your data"
 * section as a view — the data-export and account-deletion
 * actions on a SectionCard, composed from the shared widgets
 * so hosts no longer import SectionCard / Text / Button to
 * build the section themselves (the eciperay audit's coverage
 * disposition for those specifiers).
 *
 * Both actions are bare intents: the export download, the
 * deletion confirmation flow, and the API calls stay with the
 * host (the deletion confirmation composes ConfirmActionView
 * where the host presents it). Pending flags cross as props
 * and switch the labels, as the host section's busy states do.
 */
export function AccountDataView({
  title: titleProp,
  description: descriptionProp,
  onExportData,
  exportLabel: exportLabelProp,
  exportPendingLabel: exportPendingLabelProp,
  exportPending = false,
  onDeleteAccount,
  deleteLabel: deleteLabelProp,
  deletePendingLabel: deletePendingLabelProp,
  deletePending = false,
  error,
  loading = false,
}: AccountDataViewProps) {
  const voice = useVoice();
  const title = titleProp ?? voice.accountDataView.title;
  const description = descriptionProp ?? voice.accountDataView.description;
  const exportLabel = exportLabelProp ?? voice.accountDataView.exportLabel;
  const exportPendingLabel = exportPendingLabelProp ?? voice.accountDataView.exportPendingLabel;
  const deleteLabel = deleteLabelProp ?? voice.accountDataView.deleteLabel;
  const deletePendingLabel = deletePendingLabelProp ?? voice.accountDataView.deletePendingLabel;
  const showSkeleton = useLoadingScope(loading);
  return (
    <SectionCard title={title} variant="elevated" loading={showSkeleton}>
      <ContentStack>
        <SectionMutedText loading={showSkeleton} text={description} />
        <CompactRow>
          {onExportData ? (
            <Button variant="secondary" disabled={exportPending} onPress={onExportData}>
              {exportPending ? exportPendingLabel : exportLabel}
            </Button>
          ) : null}
          {onDeleteAccount ? (
            <Button variant="danger" disabled={deletePending} onPress={onDeleteAccount}>
              {deletePending ? deletePendingLabel : deleteLabel}
            </Button>
          ) : null}
        </CompactRow>
        {error && !showSkeleton ? <Text variant="error">{error}</Text> : null}
      </ContentStack>
    </SectionCard>
  );
}
