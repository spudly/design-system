import { InlineAlert } from "../components/InlineAlert.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * EditVersionPage (#124, B3a): the shell half of Eciperay's
 * edit-draft-version screen — the scrolling container, the
 * "Edit Draft (vN)" heading, the imported-draft banner, and the
 * host-composed change summary around the shared recipe form
 * (RecipeFormPage). The app screen keeps the version + parent
 * queries and the save mutation; this page is the view it renders.
 * Mirrors the app's EditVersionView shell, including its
 * not-editable state: the error line and the optional back link
 * render instead of the form (the locked version's form state
 * never mounts).
 */
export interface EditVersionPageProps extends RecipeFormPageProps {
  /** Draft version number, rendered in the heading. */
  versionNumber: number;
  /** Host-composed summary of what the draft changes, rendered
   * under the heading when provided. */
  changeSummary?: string;
  /** Renders the "based on imported vN" banner (the host decides —
   * it knows the creation path and has the parent loaded). */
  showImportBanner?: boolean;
  /** Parent version number for the import banner's line. */
  parentVersionNumber?: number;
  /** Locked version: renders the not-editable state, no form. */
  notEditable?: boolean;
  /** Back intent for the not-editable state; the link renders only
   * when the callback is provided. */
  onBack?: () => void;
}

export function EditVersionPage(props: EditVersionPageProps) {
  const {
    versionNumber,
    changeSummary,
    showImportBanner = false,
    parentVersionNumber,
    notEditable = false,
    onBack,
    ...formProps
  } = props;

  if (notEditable) {
    return (
      <ScreenContainer scrollable={false}>
        <Text variant="error">This version can no longer be edited.</Text>
        {onBack ? <TextLink onPress={onBack}>Back to recipe</TextLink> : null}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">{`Edit Draft (v${versionNumber})`}</Text>
      {showImportBanner && parentVersionNumber !== undefined ? (
        <InlineAlert severity="info">
          {`Editing draft (v${versionNumber}) based on imported v${parentVersionNumber}.`}
        </InlineAlert>
      ) : null}
      {changeSummary ? <Text variant="hint">{changeSummary}</Text> : null}
      <RecipeFormPage {...formProps} />
    </ScreenContainer>
  );
}
