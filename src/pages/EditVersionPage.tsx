import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import type { ReactNode } from "react";
import { Alert } from "../widgets/Alert.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";

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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
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
  /** Back link for the not-editable state (#248: the host
   * composes the recipe URL as an href); the link renders only
   * when the href is provided. */
  backHref?: string;
  children?: ReactNode;
};

export function EditVersionPage(props: EditVersionPageProps) {
  const {
    versionNumber,
    changeSummary,
    showImportBanner = false,
    parentVersionNumber,
    notEditable = false,
    backHref,
    children,
  } = props;

  if (notEditable) {
    return (
      <BigFooterShell footer={props.footer}>
        <ScreenContainer scrollable={false}>
          <Text variant="error">This version can no longer be edited.</Text>
          {backHref ? <TextLink href={backHref}>Back to recipe</TextLink> : null}
        </ScreenContainer>
      </BigFooterShell>
    );
  }

  return (
    <BigFooterShell footer={props.footer}>
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
    </BigFooterShell>
  );
}
