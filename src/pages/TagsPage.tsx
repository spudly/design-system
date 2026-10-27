import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Button } from "../components/Button.js";
import { ColorPickerField } from "../components/ColorPickerField.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { TagPill } from "../components/TagPill.js";
import { Text } from "../components/Text.js";
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
 * Rows render the DS TagPill (moved in B2) with a delete
 * action; the row card treatment is the app view's, on DS
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
 */

export interface TagsPageTag {
  id: string;
  name: string;
  /**
   * The tag's color: a DS tag color token name, or a legacy stored
   * hex (resolved at render — see TagPill).
   */
  color: string;
}

export interface TagsPageProps {
  tags: TagsPageTag[];
  isLoading?: boolean;
  name: string;
  /** The form's color value: a token name, or a legacy stored hex. */
  color: string;
  /** The selectable swatches, as tag color token names — host-supplied. */
  colorOptions: TagColorName[];
  onNameChange: (value: string) => void;
  onColorChange: (value: TagColorName) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isCreating?: boolean;
}

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
}: TagsPageProps) {
  return (
    <ScreenContainer>
      <Text
        variant="subheading"
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
        tags.map((tag) => (
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
            <TagPill name={tag.name} color={tag.color} />
            <XStack
              accessibilityRole="button"
              accessibilityLabel={`Delete tag ${tag.name}`}
              onPress={() => {
                onDelete(tag.id);
              }}
              cursor="web:pointer"
            >
              <Text variant="error">Delete</Text>
            </XStack>
          </XStack>
        ))
      )}
    </ScreenContainer>
  );
}
