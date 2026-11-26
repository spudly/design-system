import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { TextField } from "../../widgets/form/TextField.js";
import { Col } from "../../widgets/layout/Col.js";
import { Row } from "../../widgets/layout/Row.js";
import { useVoice } from "../../voice/index.js";

/**
 * One family-sharing designation as the host carries it
 * (eciperay's `FamilyShareGrant`): the recipient account and
 * when the designation was made (an ISO timestamp; the view
 * formats it for display, as the host form did).
 */
export type FamilySharingGrant = {
  recipientUserId: string;
  recipientEmail: string;
  recipientDisplayName?: string | null;
  createdAt: string;
};

export type FamilySharingViewProps = {
  /** Section heading. Defaults to the voice object's familySharingView title (#539). */
  title?: string;
  description?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  addLabel?: string;
  addingLabel?: string;
  loadingLabel?: string;
  emptyMessage?: string;
  removeLabel?: string;
  removingLabel?: string;
  grants: FamilySharingGrant[];
  isLoading?: boolean;
  /** The initial load failed: the list is unknown, not empty. */
  loadFailed?: boolean;
  /** Display-ready load error (the host composes it from its load failure). */
  loadError?: string | null;
  email: string;
  onEmailChange: (email: string) => void;
  adding?: boolean;
  removingId?: string | null;
  error?: string | null;
  onAdd: () => void;
  onRemove: (grant: FamilySharingGrant) => void;
};

/** The grant's display label: "Name (email)", or the email alone. */
export function familySharingGrantLabel(grant: FamilySharingGrant): string {
  return grant.recipientDisplayName
    ? `${grant.recipientDisplayName} (${grant.recipientEmail})`
    : grant.recipientEmail;
}

function formatGrantDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * FamilySharingView (#873): the profile family-sharing
 * section as a view — the explainer, the designate-by-email
 * form, and the current grants as rows with Remove actions,
 * on a SectionCard, composed from the shared widgets so
 * hosts no longer build the section themselves. Mirrors
 * FeedbackPreferenceView's structure and the eciperay app
 * host form's contract: the screen keeps the query, the
 * email state, and the mutations; removal confirmation is
 * the screen's (native has no window.confirm).
 */
export function FamilySharingView({
  title: titleProp,
  description: descriptionProp,
  emailLabel: emailLabelProp,
  emailPlaceholder: emailPlaceholderProp,
  addLabel: addLabelProp,
  addingLabel: addingLabelProp,
  loadingLabel: loadingLabelProp,
  emptyMessage: emptyMessageProp,
  removeLabel: removeLabelProp,
  removingLabel: removingLabelProp,
  grants,
  isLoading = false,
  loadFailed = false,
  loadError,
  email,
  onEmailChange,
  adding = false,
  removingId = null,
  error,
  onAdd,
  onRemove,
}: FamilySharingViewProps) {
  const voice = useVoice();
  const v = voice.familySharingView;
  const title = titleProp ?? v.title;
  const description = descriptionProp ?? v.description;
  const emailLabel = emailLabelProp ?? v.emailLabel;
  const emailPlaceholder = emailPlaceholderProp ?? v.emailPlaceholder;
  const addLabel = addLabelProp ?? v.addLabel;
  const addingLabel = addingLabelProp ?? v.addingLabel;
  const loadingLabel = loadingLabelProp ?? v.loadingLabel;
  const emptyMessage = emptyMessageProp ?? v.emptyMessage;
  const removeLabel = removeLabelProp ?? v.removeLabel;
  const removingLabel = removingLabelProp ?? v.removingLabel;
  return (
    <SectionCard title={title} variant="elevated">
      <Text variant="hint">{description}</Text>
      <TextField
        label={emailLabel}
        value={email}
        onChangeText={onEmailChange}
        placeholder={emailPlaceholder}
      />
      <Button variant="primary" disabled={!email.trim() || adding} onPress={onAdd}>
        {adding ? addingLabel : addLabel}
      </Button>
      {loadError ? <Alert severity="error" message={loadError} /> : null}
      {error ? <Alert severity="error" message={error} /> : null}
      {isLoading ? (
        <Text variant="hint">{loadingLabel}</Text>
      ) : loadFailed ? null : grants.length === 0 ? (
        <Text variant="hint">{emptyMessage}</Text>
      ) : (
        <Col>
          {grants.map((grant) => {
            const label = familySharingGrantLabel(grant);
            const removing = removingId === grant.recipientUserId;
            return (
              <Row key={grant.recipientUserId} between middle gap="m" py="s">
                <Col grow shrink>
                  <Text variant="strong">{label}</Text>
                  <Text variant="hint">{v.addedLabel(formatGrantDate(grant.createdAt))}</Text>
                </Col>
                <Button
                  variant="danger"
                  disabled={removing}
                  onPress={() => {
                    onRemove(grant);
                  }}
                  accessibilityLabel={v.removeLabelFor(label)}
                >
                  {removing ? removingLabel : removeLabel}
                </Button>
              </Row>
            );
          })}
        </Col>
      )}
    </SectionCard>
  );
}
