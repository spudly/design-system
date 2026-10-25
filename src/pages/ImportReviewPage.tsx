import type { ReactNode } from "react";
import { Image } from "react-native";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";

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
 */

export interface ImportReviewPageProps {
  versionLabel: string;
  imageUrl?: string | null;
  /** The host-rendered recipe preview (app RecipeInputPreview). */
  preview: ReactNode;
  error?: string | null;
  busy: boolean;
  acceptPending: boolean;
  editsPending: boolean;
  onAccept: () => void;
  onStartEdits: () => void;
}

export function ImportReviewPage({
  versionLabel,
  imageUrl,
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
      <Text
        variant="heading"
        fontSize={tokens.typography.fontSize["2xl"]}
        marginBottom="$6"
      >
        Review Import
      </Text>
      <Text variant="hint">
        This is your imported recipe ({versionLabel}). Looks good, or make edits
        to create a draft version.
      </Text>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            marginBottom: tokens.spacing[4],
            borderRadius: tokens.radii.lg,
            height: 192,
            width: "100%",
          }}
          resizeMode="cover"
        />
      ) : null}
      <YStack
        marginBottom="$6"
        borderRadius={tokens.radii.lg}
        borderWidth={1}
        borderColor={tokens.colors.gray.gray3}
        backgroundColor="$surface"
        padding="$4"
      >
        {preview}
      </YStack>
      {error ? (
        <YStack marginBottom="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
      <XStack flexWrap="wrap" gap="$3">
        <Button variant="primary" disabled={busy} onPress={onAccept}>
          {acceptPending ? "Saving…" : "Looks good"}
        </Button>
        <Button variant="secondary" disabled={busy} onPress={onStartEdits}>
          {editsPending ? "Creating draft…" : "Make edits"}
        </Button>
      </XStack>
    </FormScreenLayout>
  );
}
