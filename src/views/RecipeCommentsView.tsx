import { XStack, YStack } from "tamagui";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { Alert } from "../widgets/Alert.js";
import { Button } from "../widgets/Button.js";
import { Card } from "../widgets/Card.js";
import { CommentItem } from "../widgets/CommentItem.js";
import { Text } from "../widgets/Text.js";
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
  /** The comments query is in flight: the card renders
   * skeleton CommentItems — one per real comment when
   * comments are known, or exactly 3 dummy items when the
   * list is not known yet. The title and the composer render
   * as usual. An enclosing composite's LoadingScope can also
   * put the view into this state without prop-drilling. */
  loading?: boolean;
  /** The comments query failed: the card renders this message instead of the empty state. */
  error?: string | null;
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

// The dummy items for a comment-less loading view (#278):
// exactly 3 placeholder items, from a frozen module-level
// constant with stable keys — never generated per render.
// Their author/body values never render (a loading
// CommentItem renders bones only).
const LOADING_COMMENTS: RecipeCommentsViewComment[] = [
  { id: "loading-1", authorName: "Author", body: "Comment" },
  { id: "loading-2", authorName: "Author", body: "Comment" },
  { id: "loading-3", authorName: "Author", body: "Comment" },
];

/**
 * RecipeCommentsView (#438 Part 3): the recipe comments section
 * as a view — a bordered Card holding the CommentItem list and
 * the signed-in composer, composed from the shared widgets so
 * hosts no longer import Card / CommentItem / Button
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
  error,
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
  const showSkeleton = useLoadingScope(loading);
  return (
    <Card variant="bordered">
      <YStack gap="$3">
        <Text variant="subheading">{title}</Text>
        {showSkeleton ? (
          // Loading (#278): skeleton CommentItems mirroring
          // the loaded list — one per real comment (keeping
          // its edit/delete flags so its ghost actions
          // skeletonize in place), or exactly 3 dummy items
          // when the list is not known yet. The items render
          // as siblings of the title in the same stack, the
          // way loaded comments do.
          <LoadingScope active>
            {(comments.length > 0 ? comments : LOADING_COMMENTS).map((comment) => (
              <CommentItem
                key={comment.id}
                authorName={comment.authorName}
                body={comment.body}
                canEdit={comment.canEdit ?? false}
                canDelete={comment.canDelete ?? false}
                loading
              />
            ))}
          </LoadingScope>
        ) : error ? (
          <Alert severity="error" message={error} />
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
