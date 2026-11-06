import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Alert } from "../widgets/Alert.js";
import { useState } from "react";
import { Button } from "../widgets/Button.js";
import { FormScreenLayout } from "../widgets/FormScreenLayout.js";
import { TextAreaField } from "../views/TextAreaField.js";
import { Text } from "../widgets/Text.js";

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
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The title is Text's `formTitle`
 * variant (the form-flow title treatment), and the section
 * rhythm is FormScreenLayout's own.
 */

export type ImportTextPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  loading?: boolean;
  error?: string | null;
  onSubmit: (text: string) => void;
};

export function ImportTextPage({ loading = false, error, onSubmit, footer }: ImportTextPageProps) {
  const [text, setText] = useState("");

  return (
    <BigFooterShell footer={footer}>
      <FormScreenLayout>
        <Text variant="formTitle">Import from text</Text>
        <Text variant="hint">Paste a recipe from Word, a web page, or any rich text source.</Text>
        <TextAreaField
          value={text}
          onChangeText={setText}
          placeholder="Paste your recipe here…"
          accessibilityLabel="Recipe text"
        />
        {error ? <Alert severity="error" message={error} /> : null}
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
    </BigFooterShell>
  );
}
