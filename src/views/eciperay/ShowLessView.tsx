import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { Col } from "../../widgets/layout/Col.js";
import { Row } from "../../widgets/layout/Row.js";
import { useVoice } from "../../voice/index.js";

/**
 * One "show less like this" entry as the host carries it
 * (eciperay's `ShowLessItem`): a source recipe the user asked
 * to see less of.
 */
export type ShowLessEntry = {
  sourceRecipeId: string;
  title: string;
};

export type ShowLessViewProps = {
  /** Section heading. Defaults to the voice object's showLessView title (#539). */
  title?: string;
  description?: string;
  loadingLabel?: string;
  emptyMessage?: string;
  undoLabel?: string;
  loadFailedMessage?: string;
  entries: ShowLessEntry[];
  isLoading?: boolean;
  /** The initial load failed: the list is unknown, not empty. */
  loadFailed?: boolean;
  undoingId?: string | null;
  error?: string | null;
  onUndo: (sourceRecipeId: string) => void;
};

/**
 * ShowLessView (#873): the profile "show less like this"
 * section as a view — the review/reset surface for the soft
 * negative signal: each entry is a source recipe the user
 * asked to see less of, and Undo removes the entry and
 * restores the ranking of similar recipes. Entries render as
 * rows with Undo actions on a SectionCard, composed from the
 * shared widgets so hosts no longer build the section
 * themselves. Mirrors FeedbackPreferenceView's structure and
 * the eciperay app host form's contract: the screen keeps the
 * query and the undo mutation, the view renders entries and
 * errors. Entries persist until undone; there is no decay.
 */
export function ShowLessView({
  title: titleProp,
  description: descriptionProp,
  loadingLabel: loadingLabelProp,
  emptyMessage: emptyMessageProp,
  undoLabel: undoLabelProp,
  loadFailedMessage: loadFailedMessageProp,
  entries,
  isLoading = false,
  loadFailed = false,
  undoingId = null,
  error,
  onUndo,
}: ShowLessViewProps) {
  const voice = useVoice();
  const v = voice.showLessView;
  const title = titleProp ?? v.title;
  const description = descriptionProp ?? v.description;
  const loadingLabel = loadingLabelProp ?? v.loadingLabel;
  const emptyMessage = emptyMessageProp ?? v.emptyMessage;
  const undoLabel = undoLabelProp ?? v.undoLabel;
  const loadFailedMessage = loadFailedMessageProp ?? v.loadFailedMessage;
  return (
    <SectionCard title={title} variant="elevated">
      <Text variant="hint">{description}</Text>
      {loadFailed ? (
        <Alert severity="error" message={loadFailedMessage} />
      ) : isLoading ? (
        <Text variant="hint">{loadingLabel}</Text>
      ) : entries.length === 0 ? (
        <Text variant="hint">{emptyMessage}</Text>
      ) : (
        <Col>
          {entries.map((entry) => (
            <Row key={entry.sourceRecipeId} between middle gap="m" minHeight={44}>
              <Col grow shrink>
                <Text>{entry.title}</Text>
              </Col>
              <Button
                variant="secondary"
                size="sm"
                disabled={undoingId !== null}
                onPress={() => {
                  onUndo(entry.sourceRecipeId);
                }}
                accessibilityLabel={v.undoLabelFor(entry.title)}
              >
                {undoLabel}
              </Button>
            </Row>
          ))}
        </Col>
      )}
      {error ? <Alert severity="error" message={error} /> : null}
    </SectionCard>
  );
}
