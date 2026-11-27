import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { Col } from "../../widgets/layout/Col.js";
import { Text } from "../../widgets/data/Text.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";

/**
 * RecipePreviewView (#684): the parsed-recipe preview the
 * import and AI-session flows show before the recipe is
 * saved — a title, an app-formatted meta line, the ingredient
 * lines, and the instruction lines, rendered from data.
 *
 * The host parses the recipe (from text, a photo, a URL, or
 * an AI session) and supplies the preview's content as data;
 * no rendered UI crosses the boundary (the #657 pattern: the
 * page renders the shared view from data). The meta line is
 * app-formatted copy ("Serves 4 · 35 minutes") — the view
 * renders it verbatim and owns no servings/time formatting.
 * AiSessionPage and ImportReviewPage frame this view in
 * their PreviewCard.
 *
 * Loading (#874, following the #278 pattern): while
 * `loading`, the view renders text bones in the preview's
 * shape — a title line, a meta line, three ingredient lines,
 * and three instruction lines — and no parsed data renders,
 * so the host can mount the preview card before the parse
 * resolves instead of gating on a spinner. Hosts using the
 * pages pass the flag inside the preview data object: both
 * pages spread it onto this view unchanged.
 */
export type RecipePreviewViewProps = {
  /** The parsed recipe's title. */
  title: string;
  /** App-formatted meta line ("Serves 4 · 35 minutes"). */
  metaLabel?: string;
  /** The parsed ingredient lines, rendered in order. */
  ingredients?: string[];
  /** The parsed instruction lines, rendered numbered, in order. */
  instructions?: string[];
  /** Loading state (#874): renders the skeleton shape
   * described above; no parsed data renders in this state. */
  loading?: boolean;
};

export function RecipePreviewView({
  title,
  metaLabel,
  ingredients,
  instructions,
  loading = false,
}: RecipePreviewViewProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    return (
      <Col gap="s">
        <TextSkeleton size="md" lines={1} />
        <TextSkeleton size="md" lines={1} />
        <TextSkeleton size="md" lines={3} />
        <TextSkeleton size="md" lines={3} />
      </Col>
    );
  }
  return (
    <Col gap="s">
      <Text variant="strong">{title}</Text>
      {metaLabel ? <Text>{metaLabel}</Text> : null}
      {(ingredients ?? []).map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
      {(instructions ?? []).map((line, index) => (
        <Text key={index}>{`${index + 1}. ${line}`}</Text>
      ))}
    </Col>
  );
}
