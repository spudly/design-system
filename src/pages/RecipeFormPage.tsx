import type { ReactNode } from "react";
import { Alert } from "../components/Alert.js";
import { Button } from "../components/Button.js";
import { ChangedListBanner } from "../components/ChangedListBanner.js";
import { FormStack } from "../components/FormStack.js";
import { LabeledField } from "../components/LabeledField.js";
import { LabeledGroup } from "../components/LabeledGroup.js";
import { RevertAction } from "../components/RevertAction.js";
import { ScrollRegion } from "../components/ScrollRegion.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { TextField } from "../components/TextField.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { Badge } from "../components/Badge.js";

/**
 * RecipeFormPage (#124, B3a): the recipe form's view layer — the
 * split view half of Eciperay's `RecipeForm` (the B2 audit's mixed
 * disposition: form view to the DS, the rest stays app-side). The
 * three screens that compose it — create (ManualEntry), edit recipe
 * (EditRecipe), edit draft version (EditVersion) — render it through
 * the shell pages in this folder (ManualEntryPage, EditRecipePage,
 * EditVersionPage), the same shell/body split the app screens have.
 *
 * The contract follows the #49 pattern, extended to a form:
 * - Controlled scalar values, one prop + one change callback per
 *   field (the RecipesPage filter idiom): the app host owns the
 *   form state, and with it everything the audit leaves app-side —
 *   parent-version diffing, the AI description/image calls, image
 *   upload, field validation, and submission. This view validates
 *   nothing and submits nothing: `onSubmit` is a bare intent, and
 *   the host builds the recipe input from its own state.
 * - Option data is app data: status options and tag options cross
 *   as { value, label } view-models (the app owns the status set
 *   and the tags query); the status selector is a row of DS toggle
 *   Buttons (Button's `selected` form in a ButtonRow — the chip
 *   components are retired), and the tag selector is a row of
 *   selectable Badges (Badge's selectable form — a tag renders as
 *   a Badge, including when it selects). Tag loading
 *   crosses as `isLoadingTags` — the
 *   view renders the DS Spinner where the app renders its branded
 *   loader (the branded loader stays app-side by recorded decision).
 * - Version-diff presentation is view-model data: the host computes
 *   which fields changed (`changedFields`), the pre-formatted
 *   revert hint for each (`revertLabels`), and the changed-list
 *   banner lines; the view renders the DS fields' `changed` wash
 *   and the revert affordances, and reports revert intents through
 *   `onRevertField` / `onRevertTags` / `onRevertIngredients` /
 *   `onRevertInstructions`. Diffing itself never enters the view.
 * - Three sections are render slots, pending the contract picks
 *   proposed on #124: the image field (its picker invocation is
 *   native-only), and the sortable ingredient / instruction lists
 *   (built app-side on a drag library with no web equivalent).
 *   `renderImageSection` receives the image field's revert
 *   affordance as its argument — the app field renders that node in
 *   its header row, exactly where the app form puts it today; the
 *   list slots take no argument (the #49 `renderComments` shape).
 *   While `contentLocked` is set, the list slots are not rendered
 *   at all and the lock notice renders in their place — the app's
 *   behavior on the active version.
 *
 * Documented deviations from the app form's current rendering:
 * - The "Generate with AI" buttons use the DS ghost Button
 *   treatment as designed; the app form's instance-level border /
 *   background overrides on those buttons do not cross.
 * - The app form's label rows were bespoke text; here every label
 *   row is the same composition, and the scalar fields render
 *   through the DS TextField / TextAreaField chrome (with the
 *   `changed` variant carrying the diff wash — see TextField).
 * - The page applies no styling itself (#119): the scroll region
 *   is ScrollRegion, the body stack is FormStack, each field
 *   section is a LabeledField (the tags a LabeledGroup), and the
 *   revert affordances and changed-list banners are the
 *   RevertAction and ChangedListBanner components — the page
 *   composes them and passes data and callbacks only.
 */

export type RecipeFormPageField =
  "title" | "description" | "servings" | "prepTimeMin" | "cookTimeMin" | "sourceUrl" | "image";

export type RecipeFormPageOption = {
  value: string;
  label: string;
};

export type RecipeFormPageProps = {
  /** Controlled field values (text — the host parses numerics). */
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  servings: string;
  onServingsChange: (value: string) => void;
  prepTimeMin: string;
  onPrepTimeMinChange: (value: string) => void;
  cookTimeMin: string;
  onCookTimeMinChange: (value: string) => void;
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;

  /** Status picker: the option set is app data (statuses + labels). */
  statusOptions: RecipeFormPageOption[];
  status: string;
  onStatusChange: (value: string) => void;

  /** Tag picker: options come from the host's tags query. */
  tagOptions: RecipeFormPageOption[];
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  /** Tags query in flight: a spinner renders in place of the chips. */
  isLoadingTags?: boolean;

  /** Version-diff presentation (host-computed; see the header). A
   * field listed here gets the `changed` wash and, when its revert
   * label and the callback are provided, its revert affordance. */
  changedFields?: readonly RecipeFormPageField[];
  /** Pre-formatted parent-value hint per field, rendered after
   * "Revert to: " (the host formats parent values its own way). */
  revertLabels?: Partial<Record<RecipeFormPageField, string>>;
  onRevertField?: (field: RecipeFormPageField) => void;
  /** Tags-changed revert hint (parent tag names, host-formatted);
   * its presence renders the tags row's revert affordance. */
  tagsRevertLabel?: string;
  onRevertTags?: () => void;
  /** Changed-list banner lines (host-formatted, parent summary
   * included); presence renders the banner above its list slot. */
  ingredientsChangedLabel?: string;
  onRevertIngredients?: () => void;
  instructionsChangedLabel?: string;
  onRevertInstructions?: () => void;

  /** AI description generation: the call and its state stay
   * app-side; the button renders only when the callback is given. */
  onGenerateDescription?: () => void;
  isGeneratingDescription?: boolean;
  descriptionError?: string | null;

  /** Active-version lock: the list slots are replaced by the lock
   * notice; scalars and tags stay editable (the app's behavior). */
  contentLocked?: boolean;

  /** Slot: the app's image field. Receives the image revert
   * affordance (or null) for its header row — see the header. */
  renderImageSection?: (revertAction: ReactNode) => ReactNode;
  /** Slot: the app's sortable ingredient list. */
  renderIngredientsSection?: () => ReactNode;
  /** Slot: the app's sortable instruction list. */
  renderInstructionsSection?: () => ReactNode;

  /** Submit row: a bare intent out; the label is the host's
   * ("Create Recipe" / "Save Changes" / "Save Draft"). */
  submitLabel: string;
  /** Save in flight: the button disables and shows
   * `submittingLabel`. */
  isSubmitting?: boolean;
  submittingLabel?: string;
  /** Host-reported save failure, rendered above the submit row. */
  submitError?: string | null;
  onSubmit: () => void;
};

export function RecipeFormPage(props: RecipeFormPageProps) {
  const {
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    servings,
    onServingsChange,
    prepTimeMin,
    onPrepTimeMinChange,
    cookTimeMin,
    onCookTimeMinChange,
    sourceUrl,
    onSourceUrlChange,
    statusOptions,
    status,
    onStatusChange,
    tagOptions,
    tagIds,
    onTagIdsChange,
    isLoadingTags = false,
    changedFields = [],
    revertLabels = {},
    onRevertField,
    tagsRevertLabel,
    onRevertTags,
    ingredientsChangedLabel,
    onRevertIngredients,
    instructionsChangedLabel,
    onRevertInstructions,
    onGenerateDescription,
    isGeneratingDescription = false,
    descriptionError,
    contentLocked = false,
    renderImageSection,
    renderIngredientsSection,
    renderInstructionsSection,
    submitLabel,
    isSubmitting = false,
    submittingLabel = "Saving…",
    submitError,
    onSubmit,
  } = props;

  const isChanged = (field: RecipeFormPageField) => changedFields.includes(field);
  const revertAction = (field: RecipeFormPageField): ReactNode => {
    const label = revertLabels[field];
    if (!isChanged(field) || !label || !onRevertField) {
      return null;
    }
    return (
      <RevertAction
        label={label}
        onPress={() => {
          onRevertField(field);
        }}
      />
    );
  };

  const toggleTag = (value: string) => {
    onTagIdsChange(
      tagIds.includes(value) ? tagIds.filter((id) => id !== value) : [...tagIds, value],
    );
  };

  return (
    <ScrollRegion>
      <FormStack>
        <LabeledField label="Title" fieldId="recipe-title" action={revertAction("title")}>
          <TextField
            id="recipe-title"
            accessibilityLabel="Title"
            changed={isChanged("title")}
            value={title}
            onChangeText={onTitleChange}
          />
        </LabeledField>

        <LabeledField label="Status">
          <ButtonRow>
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="secondary"
                size="sm"
                selected={status === option.value}
                onPress={() => {
                  onStatusChange(option.value);
                }}
              >
                {option.label}
              </Button>
            ))}
          </ButtonRow>
        </LabeledField>

        <LabeledField
          label="Description"
          fieldId="recipe-description"
          action={
            <>
              {revertAction("description")}
              {onGenerateDescription ? (
                <Button
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Generate description with AI"
                  disabled={!title.trim() || isGeneratingDescription}
                  onPress={onGenerateDescription}
                >
                  {isGeneratingDescription ? "Generating…" : "Generate with AI"}
                </Button>
              ) : null}
            </>
          }
          error={descriptionError}
        >
          <TextAreaField
            id="recipe-description"
            accessibilityLabel="Description"
            changed={isChanged("description")}
            numberOfLines={3}
            value={description}
            onChangeText={onDescriptionChange}
          />
        </LabeledField>

        <LabeledField label="Servings" fieldId="recipe-servings" action={revertAction("servings")}>
          <TextField
            id="recipe-servings"
            accessibilityLabel="Servings"
            changed={isChanged("servings")}
            keyboardType="number-pad"
            value={servings}
            onChangeText={onServingsChange}
          />
        </LabeledField>
        <LabeledField
          label="Prep (min)"
          fieldId="recipe-prep-time"
          action={revertAction("prepTimeMin")}
        >
          <TextField
            id="recipe-prep-time"
            accessibilityLabel="Prep (min)"
            changed={isChanged("prepTimeMin")}
            keyboardType="number-pad"
            value={prepTimeMin}
            onChangeText={onPrepTimeMinChange}
          />
        </LabeledField>
        <LabeledField
          label="Cook (min)"
          fieldId="recipe-cook-time"
          action={revertAction("cookTimeMin")}
        >
          <TextField
            id="recipe-cook-time"
            accessibilityLabel="Cook (min)"
            changed={isChanged("cookTimeMin")}
            keyboardType="number-pad"
            value={cookTimeMin}
            onChangeText={onCookTimeMinChange}
          />
        </LabeledField>

        {renderImageSection ? renderImageSection(revertAction("image")) : null}

        <LabeledField
          label="Source URL"
          fieldId="recipe-source-url"
          action={revertAction("sourceUrl")}
        >
          <TextField
            id="recipe-source-url"
            accessibilityLabel="Source URL"
            changed={isChanged("sourceUrl")}
            value={sourceUrl}
            onChangeText={onSourceUrlChange}
          />
        </LabeledField>

        <LabeledGroup
          label="Tags"
          action={
            tagsRevertLabel && onRevertTags ? (
              <RevertAction label={tagsRevertLabel} onPress={onRevertTags} />
            ) : null
          }
        >
          {isLoadingTags ? (
            <Spinner label="Loading tags" />
          ) : (
            <ButtonRow>
              {tagOptions.map((option) => (
                <Badge
                  key={option.value}
                  selected={tagIds.includes(option.value)}
                  onPress={() => {
                    toggleTag(option.value);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </ButtonRow>
          )}
        </LabeledGroup>

        {contentLocked ? (
          <Alert severity="warning">
            Ingredients and instructions are locked on the active version. Create a draft to change
            them.
          </Alert>
        ) : null}

        {ingredientsChangedLabel && !contentLocked ? (
          <ChangedListBanner
            label={ingredientsChangedLabel}
            {...(onRevertIngredients ? { onRevert: onRevertIngredients } : {})}
          />
        ) : null}
        {contentLocked ? null : renderIngredientsSection ? renderIngredientsSection() : null}

        {instructionsChangedLabel && !contentLocked ? (
          <ChangedListBanner
            label={instructionsChangedLabel}
            {...(onRevertInstructions ? { onRevert: onRevertInstructions } : {})}
          />
        ) : null}
        {contentLocked ? null : renderInstructionsSection ? renderInstructionsSection() : null}

        {submitError ? <Text variant="error">{submitError}</Text> : null}
        <Button disabled={isSubmitting} onPress={onSubmit}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </FormStack>
    </ScrollRegion>
  );
}
