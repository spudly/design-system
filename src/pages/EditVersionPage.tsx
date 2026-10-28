import type { ReactNode } from "react";
import { Alert } from "../components/Alert.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";

/**
 * EditVersionPage (#124, B3a): the shell half of Eciperay's
 * edit-draft-version screen — the scrolling container, the
 * "Edit Draft (vN)" heading, the imported-draft banner, and the
 * host-composed change summary around the recipe form
 * (RecipeFormPage, rendered by the app host as this page's
 * children — the shell/body split the app screens have). The app
 * screen keeps the version + parent queries and the save
 * mutation. Mirrors the app's EditVersionView shell, including
 * its not-editable state: the error line and the optional back
 * link render instead of the children (the locked version's form
 * never mounts).
 */
export type EditVersionPageProps = {
  /** Draft version number, rendered in the heading. */
  versionNumber: number;
  /** Host-composed summary of what the draft changes, rendered
   * under the heading when provided. */
  changeSummary?: string | null;
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
  children?: ReactNode;
};

export function EditVersionPage(props: EditVersionPageProps) {
  const {
    versionNumber,
    changeSummary,
    showImportBanner = false,
    parentVersionNumber,
    notEditable = false,
    onBack,
    children,
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
        <Alert severity="info">
          {`Editing draft (v${versionNumber}) based on imported v${parentVersionNumber}.`}
        </Alert>
      ) : null}
      {changeSummary ? <Text variant="hint">{changeSummary}</Text> : null}
      {children}
    </ScreenContainer>
  );
}
