import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * ImportUrlPage (#126, B3c): the import-from-URL step — the
 * split view half of Eciperay's `ImportUrlView` (the B2
 * audit's page-view disposition). The step's screen keeps the
 * URL state, the import mutation, and navigation; this view
 * renders the form and reports the submit intent.
 *
 * Controlled, the form idiom: the URL crosses as a value +
 * change callback (the screen reads it at submit), validation
 * stays app-side, and the one presentation rule the app view
 * encodes — no import on a blank URL — is mirrored in the
 * submit's disabled state.
 */

export interface ImportUrlPageProps {
  url: string;
  onUrlChange: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit: () => void;
}

export function ImportUrlPage({
  url,
  onUrlChange,
  loading = false,
  error,
  onSubmit,
}: ImportUrlPageProps) {
  return (
    <FormScreenLayout>
      <Text variant="heading" fontSize={tokens.typography.fontSize["2xl"]} marginBottom="$6">
        Import from URL
      </Text>
      <TextField value={url} onChangeText={onUrlChange} placeholder="https://example.com/recipe" />
      {error ? (
        <YStack marginBottom="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
      <Button
        variant="primary"
        disabled={!url.trim() || loading}
        onPress={onSubmit}
        accessibilityLabel="Import"
      >
        {loading ? "Importing…" : "Import"}
      </Button>
    </FormScreenLayout>
  );
}
