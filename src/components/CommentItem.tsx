import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { TextAreaField } from "./TextAreaField.js";
import { Text } from "./Text.js";
import { TextAction } from "./TextAction.js";

export type CommentItemProps = {
  authorName: string;
  body: string;
  /** The comment was written against an older version of the content. */
  isStale?: boolean;
  /** Accessible name for the stale marker (e.g. "Based on an older version"). */
  staleHintLabel?: string;
  /** The viewer may edit this comment (their own): shows Edit/Save/Cancel. */
  canEdit?: boolean;
  /** The viewer may delete this comment (author or content owner). */
  canDelete?: boolean;
  isEditing?: boolean;
  editDraft?: string;
  isUpdatePending?: boolean;
  isDeletePending?: boolean;
  onEditDraftChange?: (value: string) => void;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onDelete?: () => void;
};

/**
 * One comment in a thread: author line (with a stale marker when the
 * comment predates the current version), the body — or an inline
 * TextAreaField editor while editing — and a row of small text actions.
 * All state is the caller's: the item renders the edit draft and pending
 * flags it is given and reports presses through the callbacks. Save
 * disables while an update is pending or the draft is blank. The text
 * actions render through the shared TextAction (#229), so they are
 * keyboard-focusable and Enter/Space-operable on web. The stale
 * marker is a ⚠ glyph whose accessible name is `staleHintLabel` (the
 * design system has no icon set; the glyph is decorative next to the
 * author name and the label carries its meaning).
 */
export function CommentItem({
  authorName,
  body,
  isStale = false,
  staleHintLabel,
  canEdit = false,
  canDelete = false,
  isEditing = false,
  editDraft = "",
  isUpdatePending = false,
  isDeletePending = false,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: CommentItemProps) {
  const saveDisabled = isUpdatePending || !editDraft.trim();

  return (
    <YStack paddingBlockEnd="$3">
      <YStack
        borderRadius={tokens.radii.md}
        backgroundColor={tokens.colors.gray.gray1}
        padding="$3"
      >
        <XStack paddingBlockEnd="$1" alignItems="center" gap="$2">
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray10}
          >
            {authorName}
          </Text>
          {isStale ? (
            <Text
              accessibilityLabel={staleHintLabel}
              fontSize={tokens.typography.fontSize.sm}
              color={tokens.colors.warning.warning7}
            >
              ⚠
            </Text>
          ) : null}
        </XStack>
        {isEditing ? (
          <YStack paddingBlockEnd="$2">
            <TextAreaField
              value={editDraft}
              onChangeText={(value) => {
                onEditDraftChange?.(value);
              }}
            />
          </YStack>
        ) : (
          <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray8}>
            {body}
          </Text>
        )}
        {canEdit || canDelete ? (
          <XStack paddingBlockStart="$2" gap="$3">
            {canEdit ? (
              isEditing ? (
                <>
                  <TextAction
                    disabled={saveDisabled}
                    color="$primary"
                    fontSize={tokens.typography.fontSize.xs}
                    fontWeight={tokens.typography.fontWeight.medium}
                    opacity={saveDisabled ? 0.5 : 1}
                    onPress={() => {
                      onSaveEdit?.();
                    }}
                  >
                    Save
                  </TextAction>
                  <TextAction
                    fontSize={tokens.typography.fontSize.xs}
                    color={tokens.colors.gray.gray7}
                    onPress={() => {
                      onCancelEdit?.();
                    }}
                  >
                    Cancel
                  </TextAction>
                </>
              ) : (
                <TextAction
                  color="$primary"
                  fontSize={tokens.typography.fontSize.xs}
                  fontWeight={tokens.typography.fontWeight.medium}
                  onPress={() => {
                    onStartEdit?.();
                  }}
                >
                  Edit
                </TextAction>
              )
            ) : null}
            {canDelete ? (
              <TextAction
                disabled={isDeletePending}
                fontSize={tokens.typography.fontSize.xs}
                color={tokens.colors.danger.danger7}
                opacity={isDeletePending ? 0.5 : 1}
                onPress={() => {
                  onDelete?.();
                }}
              >
                Delete
              </TextAction>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
    </YStack>
  );
}
