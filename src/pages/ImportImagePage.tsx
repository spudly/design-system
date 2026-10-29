import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";

/**
 * ImportImagePage (#126, B3c): the import-from-image step —
 * the split view half of Eciperay's `ImportImageView` (the B2
 * audit's page-view disposition). Both buttons are bare
 * intents: the camera/library picker invocation is native
 * business logic and stays app-side (the B3a image-picking
 * decision applied to import — the DS receives no picker
 * library and no picked file). The step's screen keeps the
 * pickers, the import mutation, and navigation.
 */

export type ImportImagePageProps = {
  loading?: boolean;
  error?: string | null;
  onPickCamera?: () => void;
  onPickLibrary?: () => void;
};

export function ImportImagePage({
  loading = false,
  error,
  onPickCamera,
  onPickLibrary,
}: ImportImagePageProps) {
  return (
    <FormScreenLayout>
      <YStack paddingBottom="$6">
        <Text variant="heading" fontSize={tokens.typography.fontSize["2xl"]}>
          Import from Image
        </Text>
      </YStack>
      <Button
        variant="primary"
        disabled={loading}
        onPress={() => {
          onPickCamera?.();
        }}
        accessibilityLabel="Take Photo"
      >
        Take Photo
      </Button>
      <YStack paddingTop="$3">
        <Button
          variant="secondary"
          disabled={loading}
          onPress={() => {
            onPickLibrary?.();
          }}
        >
          Choose from Library
        </Button>
      </YStack>
      {loading ? (
        <YStack paddingTop="$4">
          <Text color="$textMuted">Importing…</Text>
        </YStack>
      ) : null}
      {error ? (
        <YStack paddingTop="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
    </FormScreenLayout>
  );
}
