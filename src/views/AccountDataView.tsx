import { XStack, YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";

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
}: AccountDataViewProps) {
  return (
    <SectionCard title={title} variant="elevated">
      <YStack gap="$3">
        <Text variant="muted">{description}</Text>
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
        {error ? <Text variant="error">{error}</Text> : null}
      </YStack>
    </SectionCard>
  );
}
