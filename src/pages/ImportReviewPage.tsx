import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";
import { Thumbnail } from "../components/Thumbnail.js";
import { tokens } from "../tokens/index.js";

/**
 * ImportReviewPage (#126, B3c): the import review step — the
 * split view half of Eciperay's `ImportReviewView` (the B2
 * audit's page-view disposition). The step's screen keeps the
 * parsed recipe, the accept/edit mutations, and navigation;
 * this view renders the review and reports the two intents.
 *
 * The parsed recipe's preview crosses as a ReactNode slot —
 * the same shape the app view has today. The preview renderer
 * (`RecipeInputPreview`) stays app-side (proposals on #126):
 * it renders on RN primitives without a TamaguiProvider by
 * design, and both of its consumers already pass it as a node.
 * The description's version label is host data and crosses as
 * a string; the accept/edit pending labels are presentation
 * of the host's mutation states, mirrored from the app view.
 *
 * De-styled for #119: the shared pieces are the library's —
 * the hero image is Thumbnail's `banner` presentation (the
 * full-width 192px cover shape it was extracted from), the
 * title is Text's `formTitle` variant, the actions sit in a
 * ButtonRow, and the section rhythm is FormScreenLayout's
 * own. The preview slot's bordered surface frame is composed
 * inline below (AiSessionPage composes the same frame around
 * its preview stage) rather than added as a new library
 * component.
 */

export type ImportReviewPageProps = {
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
  /** The host-rendered recipe preview (app RecipeInputPreview). */
  preview: ReactNode;
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
}: ImportReviewPageProps) {
  return (
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
      <YStack
        borderRadius={tokens.radii.lg}
        borderWidth={1}
        borderColor={tokens.colors.gray.gray3}
        backgroundColor="$surface"
        padding="$4"
      >
        {preview}
      </YStack>
      {error ? <Text variant="error">{error}</Text> : null}
      <ButtonRow>
        <Button variant="primary" disabled={busy} onPress={onAccept}>
          {acceptPending ? "Saving…" : "Looks good"}
        </Button>
        <Button variant="secondary" disabled={busy} onPress={onStartEdits}>
          {editsPending ? "Creating draft…" : "Make edits"}
        </Button>
      </ButtonRow>
    </FormScreenLayout>
  );
}
