import { useState } from "react";
import { YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { Text } from "../components/Text.js";
import { tokens } from "../tokens/index.js";

/**
 * ImportTextPage (#126, B3c): the import-from-text step — the
 * split view half of Eciperay's `ImportTextView` (the B2
 * audit's page-view disposition). The import flow's steps are
 * separate routes; this step's screen keeps the import
 * mutation and navigation, and this view renders the paste
 * form and reports the submit intent.
 *
 * The textarea state is the documented exception to the
 * controlled-form idiom: the B2 audit delegated "props vs.
 * local state" for this view to B3, and it stays local
 * (proposals on #126) — nothing outside the view reads the
 * text before submit, so the host's contract is the same
 * `onSubmit(text)` the app view has today. The text crosses
 * only at submit, trimmed-check included: the button disables
 * on blank text, as in the app view.
 */

export type ImportTextPageProps = {
  loading?: boolean;
  error?: string | null;
  onSubmit: (text: string) => void;
};

export function ImportTextPage({ loading = false, error, onSubmit }: ImportTextPageProps) {
  const [text, setText] = useState("");

  return (
    <FormScreenLayout>
      <Text variant="heading" fontSize={tokens.typography.fontSize["2xl"]} marginBottom="$6">
        Import from text
      </Text>
      <Text variant="hint">Paste a recipe from Word, a web page, or any rich text source.</Text>
      <TextAreaField value={text} onChangeText={setText} placeholder="Paste your recipe here…" />
      {error ? (
        <YStack marginBottom="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
      <Button
        variant="primary"
        disabled={!text.trim() || loading}
        onPress={() => {
          onSubmit(text);
        }}
        accessibilityLabel="Import"
      >
        {loading ? "Importing…" : "Import"}
      </Button>
    </FormScreenLayout>
  );
}
