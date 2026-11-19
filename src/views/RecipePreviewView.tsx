import { YStack } from "tamagui";
import { Text } from "../widgets/Text.js";

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
};

export function RecipePreviewView({
  title,
  metaLabel,
  ingredients,
  instructions,
}: RecipePreviewViewProps) {
  return (
    <YStack gap="$2">
      <Text fontWeight="bold">{title}</Text>
      {metaLabel ? <Text>{metaLabel}</Text> : null}
      {(ingredients ?? []).map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
      {(instructions ?? []).map((line, index) => (
        <Text key={index}>{`${index + 1}. ${line}`}</Text>
      ))}
    </YStack>
  );
}
