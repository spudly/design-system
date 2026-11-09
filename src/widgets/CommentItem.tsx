import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { TextAreaField } from "../views/TextAreaField.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
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
   * place of its author line and body, with no editor; its
   * actions stay in place as inert text skeletons (its ghost
   * Buttons skeletonize as text) inside the loading scope. An
   * enclosing composite's LoadingScope can also put the item
   * into this state without prop-drilling. */
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
  const showSkeleton = useLoadingScope(loading);
  const saveDisabled = isUpdatePending || !editDraft.trim();
  // The actions row is one row in both states: while loading it
  // renders inside the loading scope, where its ghost Buttons
  // render as inert text skeletons (Stephen on #551: a ghost
  // button has no fill to skeletonize, so its label becomes a
  // text bone) instead of dropping out.
  const actionsRow =
    canEdit || canDelete ? (
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
    ) : null;
  if (showSkeleton) {
    // Loading (#278): the same framed item, with structured
    // text skeletons at the author line's and body's size
    // standing in for both — no editor, the actions row's ghost
    // buttons as text skeletons, and the region marked busy.
    return (
      <YStack paddingBlockEnd="$3">
        <LoadingScope active>
          <YStack
            borderRadius={tokens.radii.md}
            backgroundColor={tokens.colors.gray.gray1}
            padding="$3"
            {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
          >
            <YStack paddingBlockEnd="$1">
              <TextSkeleton size="sm" lines={1} />
            </YStack>
            <TextSkeleton size="sm" lines={2} />
            {actionsRow}
          </YStack>
        </LoadingScope>
      </YStack>
    );
  }

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
        {actionsRow}
      </YStack>
    </YStack>
  );
}
