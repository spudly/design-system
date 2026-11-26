import { Alert } from "../../widgets/feedback/Alert.js";
import { Button } from "../../widgets/actions/Button.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { CheckboxField } from "../../widgets/form/CheckboxField.js";
import { TextField } from "../../widgets/form/TextField.js";
import { useVoice } from "../../voice/index.js";

/**
 * The author-display settings as the host carries them
 * (eciperay's `AuthorDisplaySettings`): the name shown as the
 * author of the owner's published recipes — and whether it is
 * shown at all. The name also feeds the Recipe JSON-LD
 * `author`, app-side.
 */
type AuthorDisplaySettings = {
  displayName: string | null;
  showOnPublicRecipes: boolean;
};

export type AuthorDisplayViewProps = {
  /** Section heading. Defaults to the voice object's authorDisplayView title (#539). */
  title?: string;
  displayNameLabel?: string;
  displayNamePlaceholder?: string;
  hint?: string;
  showNameLabel?: string;
  saveLabel?: string;
  settings: AuthorDisplaySettings;
  /** Whole-settings change handler (the host form-state contract). */
  onChange: (settings: AuthorDisplaySettings) => void;
  saving?: boolean;
  /** Disable Save (e.g. until the stored settings have loaded). */
  saveDisabled?: boolean;
  error?: string | null;
  onSave: () => void;
};

/**
 * AuthorDisplayView (#873): the profile author-display
 * section as a view — the display-name field, its hint, and
 * the show-my-name checkbox on a SectionCard, composed from
 * the shared widgets so hosts no longer build the section
 * themselves. Mirrors FeedbackPreferenceView's structure and
 * the eciperay app host form's contract: the screen keeps the
 * query, the form state as a whole, and the save mutation;
 * every change reports the whole settings object through
 * `onChange`.
 */
export function AuthorDisplayView({
  title: titleProp,
  displayNameLabel: displayNameLabelProp,
  displayNamePlaceholder: displayNamePlaceholderProp,
  hint: hintProp,
  showNameLabel: showNameLabelProp,
  saveLabel: saveLabelProp,
  settings,
  onChange,
  saving = false,
  saveDisabled = false,
  error,
  onSave,
}: AuthorDisplayViewProps) {
  const voice = useVoice();
  const title = titleProp ?? voice.authorDisplayView.title;
  const displayNameLabel = displayNameLabelProp ?? voice.authorDisplayView.displayNameLabel;
  const displayNamePlaceholder =
    displayNamePlaceholderProp ?? voice.authorDisplayView.displayNamePlaceholder;
  const hint = hintProp ?? voice.authorDisplayView.hint;
  const showNameLabel = showNameLabelProp ?? voice.authorDisplayView.showNameLabel;
  const saveLabel = saveLabelProp ?? voice.authorDisplayView.saveLabel;
  return (
    <SectionCard title={title} variant="elevated">
      <TextField
        label={displayNameLabel}
        value={settings.displayName ?? ""}
        onChangeText={(next) => {
          onChange({ ...settings, displayName: next });
        }}
        placeholder={displayNamePlaceholder}
      />
      <Text variant="hint">{hint}</Text>
      <CheckboxField
        label={showNameLabel}
        checked={settings.showOnPublicRecipes}
        onCheckedChange={(next) => {
          onChange({ ...settings, showOnPublicRecipes: next });
        }}
      />
      {error ? <Alert severity="error" message={error} /> : null}
      <Button variant="primary" disabled={saving || saveDisabled} onPress={onSave}>
        {saveLabel}
      </Button>
    </SectionCard>
  );
}
