import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Alert } from "../../widgets/Alert.js";
import { RecipePreviewView, type RecipePreviewViewProps } from "../../views/RecipePreviewView.js";
import { Button } from "../../widgets/actions/Button.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { FormScreenLayout } from "../../widgets/FormScreenLayout.js";
import { PreviewCard } from "../../widgets/content/PreviewCard.js";
import { Text } from "../../widgets/data/Text.js";
import { Thumbnail } from "../../widgets/data/Thumbnail.js";

/**
 * ImportReviewPage (#126, B3c): the import review step — the
 * split view half of Eciperay's `ImportReviewView` (the B2
 * audit's page-view disposition). The step's screen keeps the
 * parsed recipe, the accept/edit mutations, and navigation;
 * this view renders the review and reports the two intents.
 *
 * The parsed recipe's preview crosses as data (#684): the
 * host supplies the parsed recipe's preview content and this
 * page renders the shared RecipePreviewView — the DS-side
 * counterpart of the app's `RecipeInputPreview`, fed by the
 * same parsed data. The description's version label is host data and crosses as
 * a string; the accept/edit pending labels are presentation
 * of the host's mutation states, mirrored from the app view.
 *
 * De-styled for #119: the shared pieces are the library's —
 * the hero image is Thumbnail's `banner` presentation (the
 * full-width 192px cover shape it was extracted from), the
 * title is Text's `formTitle` variant, the actions sit in a
 * ButtonRow, and the section rhythm is FormScreenLayout's
 * own. The preview view sits in the library's PreviewCard —
 * the bordered surface frame extracted in #331 from this
 * page's and AiSessionPage's identical hand-styled frames
 * (AiSessionPage frames its preview stage with the same
 * component, titled, with its finalize action as the actions
 * row).
 */

export type ImportReviewPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  versionLabel: string;
  imageUrl?: string | null;
  /**
   * Accessible name for the hero image (hosts pass the recipe
   * title, as the retired web view's alt text did). Applied as
   * the image's `accessibilityLabel` — react-native-web renders
   * it as the image's `alt` text on web; omit it only for a
   * purely decorative image.
   */
  imageAlt?: string;
  /** The parsed recipe's preview data (#684): rendered by the
   * page as RecipePreviewView inside the PreviewCard. */
  preview: RecipePreviewViewProps;
  error?: string | null;
  busy: boolean;
  acceptPending: boolean;
  editsPending: boolean;
  onAccept: () => void;
  onStartEdits: () => void;
};

export function ImportReviewPage({
  versionLabel,
  imageUrl,
  imageAlt,
  preview,
  error,
  busy,
  acceptPending,
  editsPending,
  onAccept,
  onStartEdits,
  footer,
}: ImportReviewPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <FormScreenLayout>
        <Text variant="formTitle">Review Import</Text>
        <Text variant="hint">
          This is your imported recipe ({versionLabel}). Looks good, or make edits to create a draft
          version.
        </Text>
        {imageUrl ? (
          <Thumbnail
            variant="banner"
            src={imageUrl}
            {...(imageAlt ? { accessibilityLabel: imageAlt } : {})}
          />
        ) : null}
        <PreviewCard>
          <RecipePreviewView {...preview} />
        </PreviewCard>
        {error ? <Alert severity="error" message={error} /> : null}
        <ButtonRow>
          <Button variant="primary" disabled={busy} onPress={onAccept}>
            {acceptPending ? "Saving…" : "Looks good"}
          </Button>
          <Button variant="secondary" disabled={busy} onPress={onStartEdits}>
            {editsPending ? "Creating draft…" : "Make edits"}
          </Button>
        </ButtonRow>
      </FormScreenLayout>
    </BigFooterShell>
  );
}
