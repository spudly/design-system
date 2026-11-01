import { useState } from "react";
import type { TagColorName } from "../themes/tagColors.js";
import { Alert } from "../components/Alert.js";
import { BadgeCardRow } from "../components/BadgeCardRow.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { CardStack } from "../components/CardStack.js";
import { ColorPickerField } from "../components/ColorPickerField.js";
import { FieldStack } from "../components/FieldStack.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { TrailingActionsRow } from "../components/TrailingActionsRow.js";

/**
 * TagsPage (#126, B3c): the tag management view — the split
 * view half of Eciperay's `TagsView` (the B2 audit's
 * page-view disposition). The screen keeps the tags query and
 * the create/delete mutations; this view renders the create
 * form and the list, and reports intents.
 *
 * The form is controlled (name + color values with change
 * callbacks), the form idiom. The selectable colors cross as a
 * prop in token names (#207): the host passes which of the DS
 * tag color names it offers (the canonical list is
 * `tagColorNames`), and the DS renders the DS ColorPickerField
 * with them, resolving each name through the active theme.
 *
 * Rows render the DS Badge in its colored-tag form (the
 * former TagPill, merged into Badge in #183) with a delete
 * action rendered through the shared TextAction (#229), so it
 * is keyboard-focusable and Enter/Space-operable on web; the
 * row card treatment is the app view's, on DS
 * tokens. While `isLoading`, the shared ListLoadingState
 * replaces the list (it stands in for the app's branded
 * loader — the RecipeFormPage precedent).
 *
 * The create form is stacked (#189): the name field takes its
 * own full-width row, and the color swatches and Add button
 * share the row below. All three previously shared one row,
 * where the swatch row overlapped the name input and the
 * input collapsed to a sliver behind the first swatch.
 *
 * That second row wraps (#219): at narrow widths the
 * ColorPickerField shrinks (its swatches wrap internally)
 * and, if the row still cannot fit, the Add button wraps
 * below the swatches instead of overflowing off-screen.
 *
 * Rows can be edited in place (eciperay#254): when the host
 * supplies `onStartEdit`, each row carries an Edit action next
 * to Delete. Starting an edit swaps the row for the edit form
 * — name field, swatches, Save/Cancel — whose draft is
 * controlled exactly like the create form and the CommentItem
 * editor: the host seeds the draft from the tag it is handed,
 * holds it while the user types, and applies it on
 * `onSaveEdit`. Without `onStartEdit` the rows stay read-only
 * apart from Delete, as before.
 *
 * De-styled for #119: the page composes DS components only —
 * the sections stack in SectionStack, the title is Text's
 * `title` variant, each form's fields stack in FieldStack,
 * the picker-and-actions rows are TrailingActionsRow (which
 * carries the #219 wrap), the editor card is Card's `compact`
 * variant, each display row renders through BadgeCardRow (the badge
 * and its actions cross as data — the badge's color among
 * them), and the rows stack in CardStack at its 8px rhythm
 * (the per-row bottom padding they carried before). The
 * display row composes through the same TrailingActionsRow
 * as the form rows, so it gains the same wrap at narrow
 * widths instead of squeezing.
 *
 * Save failures surface on the page itself (#374): the
 * mutating handlers (create, save-edit, delete) may report
 * failure by returning `false` — synchronously or from a
 * promise — or by rejecting/throwing; any other result
 * (including the `void` existing hosts return) is success.
 * The page tracks which operation failed and renders the
 * page-level error pattern — a dismissible error `Alert`
 * (its error severity announces with role="alert", the
 * #329-governed announcement mechanics) above the create
 * form, with a message naming the failed operation. There
 * is deliberately no error-string prop: hosts own no markup
 * to render one, and the copy is the page's own.
 */

export type TagsPageOperationResult = boolean | void | Promise<boolean | void>;

type TagsPageFailedOperation = "create" | "update" | "delete";

const tagsPageFailureMessages: Record<TagsPageFailedOperation, string> = {
  create: "Couldn't create the tag. Please try again.",
  update: "Couldn't save the tag changes. Please try again.",
  delete: "Couldn't delete the tag. Please try again.",
};

export type TagsPageTag = {
  id: string;
  name: string;
  /**
   * The tag's color: a DS tag color token name, strictly typed (a
   * raw hex is a compile error). The host converts stored tag data
   * to a name through `tagColorNameForHex` before passing tags in.
   */
  color: TagColorName;
};

export type TagsPageProps = {
  tags: TagsPageTag[];
  isLoading?: boolean;
  name: string;
  /** The form's color value: a tag color token name. */
  color: TagColorName;
  /** The selectable swatches, as tag color token names — host-supplied. */
  colorOptions: TagColorName[];
  onNameChange: (value: string) => void;
  onColorChange: (value: TagColorName) => void;
  /** Creates the tag; returning `false` (or rejecting) reports failure (#374). */
  onCreate: () => TagsPageOperationResult;
  /** Deletes the tag; returning `false` (or rejecting) reports failure (#374). */
  onDelete: (id: string) => TagsPageOperationResult;
  isCreating?: boolean;
  /** Id of the tag whose row is showing the inline edit form, if any. */
  editingTagId?: string | null;
  /** The edit form's name draft (controlled, like the create form). */
  editName?: string;
  /** The edit form's color draft: a tag color token name. */
  editColor?: TagColorName;
  /**
   * Starts an inline edit of the given tag; the host seeds the
   * edit draft from it. When omitted, rows offer no Edit action.
   */
  onStartEdit?: (tag: TagsPageTag) => void;
  onEditNameChange?: (value: string) => void;
  onEditColorChange?: (value: TagColorName) => void;
  /**
   * Applies the edit draft to the tag named by `editingTagId`;
   * returning `false` (or rejecting) reports failure (#374).
   */
  onSaveEdit?: () => TagsPageOperationResult;
  onCancelEdit?: () => void;
  isUpdating?: boolean;
};

export function TagsPage({
  tags,
  isLoading = false,
  name,
  color,
  colorOptions,
  onNameChange,
  onColorChange,
  onCreate,
  onDelete,
  isCreating = false,
  editingTagId = null,
  editName = "",
  editColor,
  onStartEdit,
  onEditNameChange,
  onEditColorChange,
  onSaveEdit,
  onCancelEdit,
  isUpdating = false,
}: TagsPageProps) {
  const [failedOperation, setFailedOperation] = useState<TagsPageFailedOperation | null>(null);

  const runOperation = async (
    operation: TagsPageFailedOperation,
    action: () => TagsPageOperationResult,
  ) => {
    try {
      const result = await action();
      setFailedOperation(result === false ? operation : null);
    } catch {
      setFailedOperation(operation);
    }
  };

  const handleCreate = () => {
    void runOperation("create", onCreate);
  };

  const handleSaveEdit = () => {
    void runOperation("update", () => onSaveEdit?.());
  };

  const handleDelete = (id: string) => {
    void runOperation("delete", () => onDelete(id));
  };

  return (
    <ScreenContainer>
      <SectionStack>
        <Text variant="title">Tags</Text>
        {failedOperation ? (
          <Alert
            severity="error"
            dismissible
            onDismiss={() => {
              setFailedOperation(null);
            }}
          >
            {tagsPageFailureMessages[failedOperation]}
          </Alert>
        ) : null}
        <FieldStack>
          <TextField placeholder="Tag name" value={name} onChangeText={onNameChange} />
          <TrailingActionsRow
            leading={
              <ColorPickerField colors={colorOptions} value={color} onChange={onColorChange} />
            }
          >
            <Button
              variant="primary"
              disabled={!name.trim() || isCreating}
              onPress={handleCreate}
              accessibilityLabel="Add"
            >
              Add
            </Button>
          </TrailingActionsRow>
        </FieldStack>
        {isLoading ? (
          <ListLoadingState label="Loading tags" />
        ) : (
          <CardStack>
            {tags.map((tag) =>
              editingTagId === tag.id ? (
                <Card key={tag.id} variant="compact">
                  <FieldStack>
                    <TextField
                      placeholder="Tag name"
                      value={editName}
                      onChangeText={(value) => {
                        onEditNameChange?.(value);
                      }}
                      accessibilityLabel={`Rename tag ${tag.name}`}
                    />
                    <TrailingActionsRow
                      leading={
                        <ColorPickerField
                          colors={colorOptions}
                          value={editColor ?? tag.color}
                          onChange={(value) => {
                            onEditColorChange?.(value);
                          }}
                        />
                      }
                    >
                      <Button
                        variant="secondary"
                        disabled={isUpdating}
                        onPress={() => {
                          onCancelEdit?.();
                        }}
                        accessibilityLabel="Cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!editName.trim() || isUpdating}
                        onPress={handleSaveEdit}
                        accessibilityLabel="Save"
                      >
                        Save
                      </Button>
                    </TrailingActionsRow>
                  </FieldStack>
                </Card>
              ) : (
                <BadgeCardRow
                  key={tag.id}
                  badgeLabel={tag.name}
                  badgeColor={tag.color}
                  actions={[
                    ...(onStartEdit
                      ? [
                          {
                            label: "Edit",
                            accessibilityLabel: `Edit tag ${tag.name}`,
                            onPress: () => {
                              onStartEdit(tag);
                            },
                          },
                        ]
                      : []),
                    {
                      label: "Delete",
                      accessibilityLabel: `Delete tag ${tag.name}`,
                      variant: "error" as const,
                      onPress: () => {
                        handleDelete(tag.id);
                      },
                    },
                  ]}
                />
              ),
            )}
          </CardStack>
        )}
      </SectionStack>
    </ScreenContainer>
  );
}
