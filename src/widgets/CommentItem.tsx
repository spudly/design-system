import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { TextAreaField } from "../views/TextAreaField.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

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
  /** Loading state (#278): the item renders text skeletons in
   * place of its author line and body, with no editor and no
   * actions. An enclosing composite's LoadingScope can also
   * put the item into this state without prop-drilling. */
  loading?: boolean;
};

/**
 * One comment in a thread: author line (with a stale marker when the
 * comment predates the current version), the body — or an inline
 * TextAreaField editor while editing — and a row of small text actions.
 * All state is the caller's: the item renders the edit draft and pending
 * flags it is given and reports presses through the callbacks. Save
 * disables while an update is pending or the draft is blank. The
 * actions render as ghost Buttons (#464, retiring TextAction), so
 * they are real buttons — keyboard-focusable and
 * Enter/Space-operable on web. The stale
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
  loading = false,
}: CommentItemProps) {
  const scopedLoading = useLoadingScope();
  const showSkeleton = loading || scopedLoading;
  if (showSkeleton) {
    // Loading (#278): the same framed item, with text skeletons
    // standing in for the author line and the body — no editor,
    // no actions, and the region marked busy.
    return (
      <YStack paddingBlockEnd="$3">
        <YStack
          borderRadius={tokens.radii.md}
          backgroundColor={tokens.colors.gray.gray1}
          padding="$3"
          {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
        >
          <TextSkeleton lines={3} />
        </YStack>
      </YStack>
    );
  }
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
                  <Button
                    ghost
                    size="sm"
                    disabled={saveDisabled}
                    onPress={() => {
                      onSaveEdit?.();
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    ghost
                    size="sm"
                    variant="secondary"
                    onPress={() => {
                      onCancelEdit?.();
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  ghost
                  size="sm"
                  onPress={() => {
                    onStartEdit?.();
                  }}
                >
                  Edit
                </Button>
              )
            ) : null}
            {canDelete ? (
              <Button
                ghost
                size="sm"
                variant="danger"
                disabled={isDeletePending}
                onPress={() => {
                  onDelete?.();
                }}
              >
                Delete
              </Button>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
    </YStack>
  );
}
