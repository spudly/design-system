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
      <Text variant="heading" fontSize={tokens.typography.fontSize["2xl"]} marginBottom="$6">
        Import from Image
      </Text>
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
      <YStack marginTop="$3">
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
        <Text color="$textMuted" marginTop="$4">
          Importing…
        </Text>
      ) : null}
      {error ? (
        <YStack marginTop="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
    </FormScreenLayout>
  );
}
