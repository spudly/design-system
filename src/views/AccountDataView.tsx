import { XStack, YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

export type AccountDataViewProps = {
  /** Section heading ("Your data"). */
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
  title = "Your data",
  description = "Download a copy of your recipes and account data, or delete your account.",
  onExportData,
  exportLabel = "Download my data",
  exportPendingLabel = "Preparing…",
  exportPending = false,
  onDeleteAccount,
  deleteLabel = "Delete account",
  deletePendingLabel = "Deleting…",
  deletePending = false,
  error,
  loading = false,
}: AccountDataViewProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <SectionCard title={title} variant="elevated" loading={showSkeleton}>
      <YStack gap="$3">
        {showSkeleton ? (
          // The description bone takes the two lines the
          // description copy wraps to at the section's width —
          // a single line left the actions shifted up by a
          // line (Stephen on #579).
          <TextSkeleton size="md" lines={2} />
        ) : (
          <Text variant="muted">{description}</Text>
        )}
        <XStack gap="$2" flexWrap="wrap">
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
        </XStack>
        {error && !showSkeleton ? <Text variant="error">{error}</Text> : null}
      </YStack>
    </SectionCard>
  );
}
