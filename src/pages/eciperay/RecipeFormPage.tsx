import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import type { ReactNode } from "react";
import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";
import { ChangedListBanner } from "../../widgets/feedback/ChangedListBanner.js";
import { RecipeImageView, type RecipeImageViewProps } from "../../views/RecipeImageView.js";
import {
  RecipeIngredientListView,
  type RecipeIngredientListViewProps,
} from "../../views/RecipeIngredientListView.js";
import {
  RecipeInstructionListView,
  type RecipeInstructionListViewProps,
} from "../../views/RecipeInstructionListView.js";
import { EqualColumns } from "../../widgets/form/EqualColumns.js";
import { FormStack } from "../../widgets/layout/FormStack.js";
import { LabeledField } from "../../widgets/form/LabeledField.js";
import { LabeledGroup } from "../../widgets/form/LabeledGroup.js";
import { RevertAction } from "../../views/RevertAction.js";
import { ScrollRegion } from "../../widgets/layout/ScrollRegion.js";
import { TagList } from "../../widgets/data/TagList.js";
import { TextAreaField } from "../../widgets/form/TextAreaField.js";
import { TextField } from "../../widgets/form/TextField.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { Badge } from "../../widgets/data/Badge.js";

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
 * - Option data is app data: tag options cross
 *   as { value, label } view-models (the app owns the tags query);
 *   the tag selector is a row of
 *   selectable Badges (Badge's selectable form — a tag renders as
 *   a Badge, including when it selects). Tag loading
 *   crosses as `loadingTags` — while it is set, the tag row
 *   renders TagList's loading state (#278, tranche 4: exactly
 *   3 dummy pill skeletons at the Badge pill geometry, the
 *   region marked busy) instead of the selectable Badges; the
 *   rest of the form — user input, not loaded content — stays
 *   live.
 * - Version-diff presentation is view-model data: the host computes
 *   which fields changed (`changedFields`), the pre-formatted
 *   revert hint for each (`revertLabels`), and the changed-list
 *   banner lines; the view renders the DS fields' `changed` wash
 *   and the revert affordances, and reports revert intents through
 *   `onRevertField` / `onRevertTags` / `onRevertIngredients` /
 *   `onRevertInstructions`. Diffing itself never enters the view.
 * - The image section renders from props: the `image` data
 *   prop carries the view-half contract approved on #124
 *   (preview URI, busy flags, error, generate gate), and the
 *   page renders RecipeImageView with the image revert
 *   affordance as its header action. (The section's former
 *   render slot was removed in #683 — the data prop is the
 *   only path.)
 * - The sortable lists render from props the same way: the
 *   `ingredients` / `instructions` data props carry the list
 *   views' contracts (the settled #124 row view-models plus
 *   field-change / add / remove intents), and the page renders
 *   RecipeIngredientListView / RecipeInstructionListView from
 *   them. Stephen's 2026-11-09 boundary on #130 governs the
 *   split: the DS owns the row views and the list chrome; the
 *   hosts keep their drag containers (dnd-kit on web,
 *   DraggableFlatList on native) and bind the handle through
 *   the views' `renderDragHandle` — no drag library enters
 *   the DS, and a reorder crosses back as a new rows array.
 *   (The lists' former render slots were removed in #683 —
 *   the data props are the only paths.) While `contentLocked`
 *   is set, the lists are not rendered at all and the
 *   lock notice renders in their place — the app's behavior
 *   on the active version.
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
 *   section is a LabeledField (the tags a LabeledGroup, the
 *   servings / prep / cook fields a EqualColumns row of
 *   LabeledFields), and the
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

// The image section's view-model lives with the view (#130);
// the page's contract name is an alias, so consumers of the
// page's types are untouched (the RecipeDetailPage ratings
// precedent). The view's `headerAction` is the page's own
// revert affordance, so it is not part of the data prop.
type RecipeFormPageImage = Omit<RecipeImageViewProps, "headerAction">;

// The sortable lists' view-models live with their views
// (#130, tranche T4); the page's contract names are aliases,
// the same precedent as the image section above. The list
// views carry no page-supplied chrome of their own, so the
// data props are the views' full contracts.
type RecipeFormPageIngredients = RecipeIngredientListViewProps;
type RecipeFormPageInstructions = RecipeInstructionListViewProps;

export type RecipeFormPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
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

  /** Tag picker: options come from the host's tags query. */
  tagOptions: RecipeFormPageOption[];
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  /** Tags query in flight: a spinner renders in place of the chips. */
  loadingTags?: boolean;

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

  /** The image section's data (the #124 view-half contract):
   * the page renders RecipeImageView from it. The page
   * supplies the view's `headerAction` itself (the image
   * revert affordance). */
  image?: RecipeFormPageImage | null;
  /** The ingredient list's data (the #124 row contracts plus
   * the list chrome's intents): the page renders
   * RecipeIngredientListView from it. The host's drag handle
   * binds through the view's `renderDragHandle` (see the
   * header). */
  ingredients?: RecipeFormPageIngredients | null;
  /** The instruction list's data: the page renders
   * RecipeInstructionListView from it. */
  instructions?: RecipeFormPageInstructions | null;

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
    tagOptions,
    tagIds,
    onTagIdsChange,
    loadingTags = false,
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
    image,
    ingredients,
    instructions,
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
    <BigFooterShell footer={props.footer} scrollMode="content">
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

          <LabeledField
            label="Description"
            fieldId="recipe-description"
            action={
              <>
                {revertAction("description")}
                {onGenerateDescription ? (
                  <Button
                    ghost
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

          <EqualColumns>
            <LabeledField
              label="Servings"
              fieldId="recipe-servings"
              action={revertAction("servings")}
            >
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
          </EqualColumns>

          {image ? <RecipeImageView {...image} headerAction={revertAction("image")} /> : null}

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
            {loadingTags ? (
              <TagList tags={[]} loading />
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
              Ingredients and instructions are locked on the active version. Create a draft to
              change them.
            </Alert>
          ) : null}

          {ingredientsChangedLabel && !contentLocked ? (
            <ChangedListBanner
              label={ingredientsChangedLabel}
              {...(onRevertIngredients ? { onRevert: onRevertIngredients } : {})}
            />
          ) : null}
          {contentLocked ? null : ingredients ? (
            <RecipeIngredientListView {...ingredients} />
          ) : null}

          {instructionsChangedLabel && !contentLocked ? (
            <ChangedListBanner
              label={instructionsChangedLabel}
              {...(onRevertInstructions ? { onRevert: onRevertInstructions } : {})}
            />
          ) : null}
          {contentLocked ? null : instructions ? (
            <RecipeInstructionListView {...instructions} />
          ) : null}

          {submitError ? <Alert severity="error" message={submitError} /> : null}
          <Button disabled={isSubmitting} onPress={onSubmit}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </FormStack>
      </ScrollRegion>
    </BigFooterShell>
  );
}
