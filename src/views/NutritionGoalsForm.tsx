import { Alert } from "../widgets/Alert.js";
import { YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { Center } from "../widgets/Center.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "../widgets/TextSkeleton.js";
import { TextField } from "./TextField.js";
import { useVoice } from "../voice/index.js";

/**
 * NutritionGoalsForm (#126, B3c): the daily nutrition goals
 * section of the profile screen — the split view half of
 * Eciperay's `NutritionGoalsFormView` (the B2 audit's
 * page-view (section) disposition). The app screen keeps the
 * goals query, the form state as a whole, and the save
 * mutation; this section renders the fields and reports
 * whole-goals changes.
 *
 * The values cross as the goals view-model (numbers or null),
 * and each field's text parse/format is presentation that
 * lives in the view, exactly as in the app view: an empty or
 * non-numeric field crosses back as null. The section
 * validates nothing — the host owns the save.
 *
 * Each goal is a min/max range (#607, mirroring eciperay
 * #521's flat min/max contract): the form renders a Min and a
 * Max field per goal, each independently optional (blank =
 * null), so a goal can carry a floor, a ceiling, both, or
 * neither.
 */

export type NutritionGoalsValues = {
  caloriesMin: number | null;
  caloriesMax: number | null;
  proteinGMin: number | null;
  proteinGMax: number | null;
  carbsGMin: number | null;
  carbsGMax: number | null;
  fatGMin: number | null;
  fatGMax: number | null;
  satietyScoreMin: number | null;
  satietyScoreMax: number | null;
};

export type NutritionGoalsFormProps = {
  goals: NutritionGoalsValues;
  onChange: (goals: NutritionGoalsValues) => void;
  saving?: boolean;
  error?: string | null;
  onSave: () => void;
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, each of the ten goal fields
   * renders as a label text skeleton at its own (sm) size over
   * a field-height box skeleton in the field's slot instead of
   * the live TextField, the Save action stays rendered inside
   * the card's loading scope so the Button renders as a
   * rectangle skeleton at its normal geometry, and the error
   * is hidden — no real goal values show. An enclosing
   * composite's LoadingScope can also put the form into this
   * state without prop-drilling. */
  loading?: boolean;
};

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function formatGoalValue(value: number | null): string {
  return value === null ? "" : String(value);
}

function GoalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const voice = useVoice();
  return (
    <TextField
      label={label}
      value={formatGoalValue(value)}
      onChangeText={(text) => {
        onChange(parseOptionalNumber(text));
      }}
      placeholder={voice.nutritionGoalsForm.optionalPlaceholder}
    />
  );
}

// The loading form's field keys (#278): the ten goal fields in
// display order (min then max per goal, #607), from a frozen
// module-level constant — never generated per render. Each
// skeleton field mirrors a TextField's own stack: the label's
// gap ($1) over the input, whose minimum height is 44. The
// label bone sits centered in the field Label's own line box
// (SIZABLE_TEXT_LINE_BOX, 27) — a TextSkeleton sm line box
// (16) in its place leaves each field 11px short, and the ten
// fields accumulate the drift, so the bones slide off the
// loaded form (Stephen on #579).
const LOADING_GOAL_FIELD_KEYS = [
  "caloriesMin",
  "caloriesMax",
  "proteinGMin",
  "proteinGMax",
  "carbsGMin",
  "carbsGMax",
  "fatGMin",
  "fatGMax",
  "satietyScoreMin",
  "satietyScoreMax",
] as const;

function GoalFieldSkeleton() {
  return (
    <YStack gap="$1">
      <Center width="35%" height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
        <TextSkeleton size="sm" lines={1} />
      </Center>
      <BoxSkeleton height={44} />
    </YStack>
  );
}

export function NutritionGoalsForm({
  goals,
  onChange,
  saving = false,
  error,
  onSave,
  loading = false,
}: NutritionGoalsFormProps) {
  const voice = useVoice();
  const showSkeleton = useLoadingScope(loading);
  const patch = (partial: Partial<NutritionGoalsValues>) => {
    onChange({ ...goals, ...partial });
  };

  return (
    <SectionCard title={voice.nutritionGoalsForm.title} loading={showSkeleton}>
      {showSkeleton ? (
        LOADING_GOAL_FIELD_KEYS.map((key) => <GoalFieldSkeleton key={key} />)
      ) : (
        <>
          <GoalField
            label={`${voice.nutritionGoalsForm.caloriesLabel} ${voice.nutritionGoalsForm.minLabel}`}
            value={goals.caloriesMin}
            onChange={(caloriesMin) => {
              patch({ caloriesMin });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.caloriesLabel} ${voice.nutritionGoalsForm.maxLabel}`}
            value={goals.caloriesMax}
            onChange={(caloriesMax) => {
              patch({ caloriesMax });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.proteinLabel} ${voice.nutritionGoalsForm.minLabel}`}
            value={goals.proteinGMin}
            onChange={(proteinGMin) => {
              patch({ proteinGMin });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.proteinLabel} ${voice.nutritionGoalsForm.maxLabel}`}
            value={goals.proteinGMax}
            onChange={(proteinGMax) => {
              patch({ proteinGMax });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.carbsLabel} ${voice.nutritionGoalsForm.minLabel}`}
            value={goals.carbsGMin}
            onChange={(carbsGMin) => {
              patch({ carbsGMin });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.carbsLabel} ${voice.nutritionGoalsForm.maxLabel}`}
            value={goals.carbsGMax}
            onChange={(carbsGMax) => {
              patch({ carbsGMax });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.fatLabel} ${voice.nutritionGoalsForm.minLabel}`}
            value={goals.fatGMin}
            onChange={(fatGMin) => {
              patch({ fatGMin });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.fatLabel} ${voice.nutritionGoalsForm.maxLabel}`}
            value={goals.fatGMax}
            onChange={(fatGMax) => {
              patch({ fatGMax });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.satietyScoreLabel} ${voice.nutritionGoalsForm.minLabel}`}
            value={goals.satietyScoreMin}
            onChange={(satietyScoreMin) => {
              patch({ satietyScoreMin });
            }}
          />
          <GoalField
            label={`${voice.nutritionGoalsForm.satietyScoreLabel} ${voice.nutritionGoalsForm.maxLabel}`}
            value={goals.satietyScoreMax}
            onChange={(satietyScoreMax) => {
              patch({ satietyScoreMax });
            }}
          />
        </>
      )}
      {error && !showSkeleton ? <Alert severity="error" message={error} /> : null}
      <YStack paddingTop="$3">
        <Button variant="primary" disabled={saving} onPress={onSave}>
          {voice.nutritionGoalsForm.saveLabel}
        </Button>
      </YStack>
    </SectionCard>
  );
}
