import { XStack, YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { CommentItem } from "../components/CommentItem.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextAreaField } from "./TextAreaField.js";

export type RecipeCommentsViewComment = {
  id: string;
  authorName: string;
  body: string;
  /** The comment was written against an older version of the content. */
  isStale?: boolean;
  /** The viewer may edit this comment (their own). */
  canEdit?: boolean;
  /** The viewer may delete this comment (author or content owner). */
  canDelete?: boolean;
};

export type RecipeCommentsViewProps = {
  comments: RecipeCommentsViewComment[];
  /** The comments query is in flight: the card renders only a spinner. */
  loading?: boolean;
  /** Section heading ("Comments"). */
  title?: string;
  /** Shown when the list is empty and not loading ("No comments yet"). */
  emptyMessage?: string;
  /** Accessible name for a stale comment's marker. */
  staleHintLabel?: string;
  /** The comment currently being edited, if any. */
  editingCommentId?: string | null;
  editDraft?: string;
  isUpdatePending?: boolean;
  isDeletePending?: boolean;
  onEditDraftChange?: (value: string) => void;
  onStartEdit?: (commentId: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  /**
   * The composer. It renders only when `onPost` is provided (the
   * host passes it for signed-in viewers); the draft is controlled.
   */
  draft?: string;
  onDraftChange?: (value: string) => void;
  onPost?: () => void;
  isPostPending?: boolean;
  composerLabel?: string;
  composerPlaceholder?: string;
  postLabel?: string;
};

/**
 * RecipeCommentsView (#438 Part 3): the recipe comments section
 * as a view — a bordered Card holding the CommentItem list and
 * the signed-in composer, composed from the shared widgets so
 * hosts no longer import Card / CommentItem / Spinner / Button
 * to build the section themselves (the eciperay audit's
 * coverage disposition for those specifiers).
 *
 * All state stays with the caller, as with the host section
 * this ports: the comments cross as view-models, the edit
 * session (which comment, its draft, the pending flags) is
 * the caller's, and every intent reports the comment's id.
 * The composer renders only when `onPost` is provided; posting
 * disables while a post is pending or the draft is blank.
 */
export function RecipeCommentsView({
  comments,
  loading = false,
  title = "Comments",
  emptyMessage = "No comments yet",
  staleHintLabel,
  editingCommentId,
  editDraft = "",
  isUpdatePending = false,
  isDeletePending = false,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteComment,
  draft = "",
  onDraftChange,
  onPost,
  isPostPending = false,
  composerLabel = "Add a comment",
  composerPlaceholder = "Share how it turned out…",
  postLabel = "Post comment",
}: RecipeCommentsViewProps) {
  return (
    <Card variant="bordered">
      <YStack gap="$3">
        <Text variant="subheading">{title}</Text>
        {loading ? (
          <YStack alignItems="center" paddingVertical="$4">
            <Spinner label="Loading comments" />
          </YStack>
        ) : comments.length === 0 ? (
          <Text variant="muted">{emptyMessage}</Text>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              authorName={comment.authorName}
              body={comment.body}
              isStale={comment.isStale ?? false}
              {...(staleHintLabel ? { staleHintLabel } : {})}
              canEdit={comment.canEdit ?? false}
              canDelete={comment.canDelete ?? false}
              isEditing={editingCommentId === comment.id}
              editDraft={editDraft}
              isUpdatePending={isUpdatePending}
              isDeletePending={isDeletePending}
              {...(onEditDraftChange ? { onEditDraftChange } : {})}
              onStartEdit={() => onStartEdit?.(comment.id)}
              {...(onCancelEdit ? { onCancelEdit } : {})}
              onSaveEdit={() => onSaveEdit?.(comment.id)}
              onDelete={() => onDeleteComment?.(comment.id)}
            />
          ))
        )}
        {onPost ? (
          <YStack gap="$2">
            <TextAreaField
              label={composerLabel}
              value={draft}
              {...(onDraftChange ? { onChangeText: onDraftChange } : {})}
              placeholder={composerPlaceholder}
              numberOfLines={3}
            />
            <XStack justifyContent="flex-end">
              <Button
                variant="primary"
                size="sm"
                disabled={isPostPending || draft.trim().length === 0}
                onPress={onPost}
              >
                {postLabel}
              </Button>
            </XStack>
          </YStack>
        ) : null}
      </YStack>
    </Card>
  );
}
