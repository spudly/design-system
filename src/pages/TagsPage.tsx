import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Button } from "../components/Button.js";
import { ColorPickerField } from "../components/ColorPickerField.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { Badge } from "../components/Badge.js";
import { Text } from "../components/Text.js";
import { TextAction } from "../components/TextAction.js";
import { TextField } from "../components/TextField.js";

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
 * tokens. While `isLoading`, a spinner replaces the list (the
 * DS Spinner stands in for the app's branded loader — the
 * RecipeFormPage precedent).
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
 */

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
  onCreate: () => void;
  onDelete: (id: string) => void;
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
  /** Applies the edit draft to the tag named by `editingTagId`. */
  onSaveEdit?: () => void;
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
  return (
    <ScreenContainer>
      <Text
        variant="heading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Tags
      </Text>
      <YStack marginBottom="$6" gap="$3">
        <TextField placeholder="Tag name" value={name} onChangeText={onNameChange} />
        <XStack flexWrap="wrap" gap="$2" alignItems="center" justifyContent="space-between">
          <ColorPickerField colors={colorOptions} value={color} onChange={onColorChange} />
          <Button
            variant="primary"
            disabled={!name.trim() || isCreating}
            onPress={onCreate}
            accessibilityLabel="Add"
          >
            Add
          </Button>
        </XStack>
      </YStack>
      {isLoading ? (
        <Spinner label="Loading tags" />
      ) : (
        tags.map((tag) =>
          editingTagId === tag.id ? (
            <YStack
              key={tag.id}
              marginBottom="$2"
              gap="$3"
              borderRadius={tokens.radii.md}
              backgroundColor="$surface"
              padding="$3"
              shadowColor={tokens.shadows.sm.shadowColor}
              shadowOffset={tokens.shadows.sm.shadowOffset}
              shadowOpacity={tokens.shadows.sm.shadowOpacity}
              shadowRadius={tokens.shadows.sm.shadowRadius}
            >
              <TextField
                placeholder="Tag name"
                value={editName}
                onChangeText={(value) => {
                  onEditNameChange?.(value);
                }}
                accessibilityLabel={`Rename tag ${tag.name}`}
              />
              <XStack flexWrap="wrap" gap="$2" alignItems="center" justifyContent="space-between">
                <ColorPickerField
                  colors={colorOptions}
                  value={editColor ?? tag.color}
                  onChange={(value) => {
                    onEditColorChange?.(value);
                  }}
                />
                <XStack gap="$2">
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
                    onPress={() => {
                      onSaveEdit?.();
                    }}
                    accessibilityLabel="Save"
                  >
                    Save
                  </Button>
                </XStack>
              </XStack>
            </YStack>
          ) : (
            <XStack
              key={tag.id}
              marginBottom="$2"
              alignItems="center"
              justifyContent="space-between"
              borderRadius={tokens.radii.md}
              backgroundColor="$surface"
              padding="$3"
              shadowColor={tokens.shadows.sm.shadowColor}
              shadowOffset={tokens.shadows.sm.shadowOffset}
              shadowOpacity={tokens.shadows.sm.shadowOpacity}
              shadowRadius={tokens.shadows.sm.shadowRadius}
            >
              <Badge color={tag.color}>{tag.name}</Badge>
              <XStack gap="$3" alignItems="center">
                {onStartEdit ? (
                  <TextAction
                    accessibilityLabel={`Edit tag ${tag.name}`}
                    onPress={() => {
                      onStartEdit(tag);
                    }}
                  >
                    Edit
                  </TextAction>
                ) : null}
                <TextAction
                  variant="error"
                  accessibilityLabel={`Delete tag ${tag.name}`}
                  onPress={() => {
                    onDelete(tag.id);
                  }}
                >
                  Delete
                </TextAction>
              </XStack>
            </XStack>
          ),
        )
      )}
    </ScreenContainer>
  );
}
