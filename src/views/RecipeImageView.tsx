import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Alert } from "../widgets/Alert.js";
import { Button } from "../widgets/Button.js";
import { ButtonRow } from "../widgets/ButtonRow.js";
import { LabeledGroup } from "../widgets/LabeledGroup.js";
import { Text } from "../widgets/Text.js";
import { Thumbnail } from "../widgets/Thumbnail.js";
import { tokens } from "../tokens/index.js";

export type RecipeImageViewProps = {
  /** Section label ("Recipe image"). */
  label?: string;
  /**
   * The current image's preview URI; null (or omitted) renders
   * the empty state. A pending, not-yet-applied selection never
   * crosses — the host's picker flow owns it until it applies.
   */
  imagePreviewUri?: string | null;
  /** Upload in flight: the pick action reads "Uploading…" and
   * every action disables. */
  isUploading?: boolean;
  /** AI generation in flight: the generate action reads
   * "Generating…" and every action disables. */
  isGenerating?: boolean;
  /** Host-reported failure (upload / generation), rendered as
   * an error alert below the preview. */
  error?: string | null;
  /**
   * Whether AI generation is currently available (the host's
   * own gate — plan, configuration); false disables the
   * generate action. Irrelevant when no generate intent is
   * provided: the action then does not render at all.
   */
  canGenerateImage?: boolean;
  /** The empty state's line; hosts whose field offers no
   * generation pass their own copy. */
  emptyMessage?: string;
  /** Trailing action for the label row (the form page passes
   * its revert affordance). */
  headerAction?: ReactNode;
  /**
   * Bare intent: choose an image. The host opens its own
   * picker / browse / crop flow — the design system never
   * calls a picker library (the #124 contract decision).
   */
  onPickImageRequest: () => void;
  /**
   * Bare intent: take a photo. Renders only when provided —
   * the hosts whose picker separates capture from browse
   * (the web field) pass it; a single-picker host omits it.
   */
  onTakePhotoRequest?: () => void;
  /** Bare intent: generate an image with AI. Renders only
   * when provided. */
  onGenerateImageRequest?: () => void;
  /** Bare intent: remove the current image. The action
   * renders only while a preview is showing. */
  onRemoveImage: () => void;
};

/**
 * RecipeImageView (#130, Workstream A): the recipe form's
 * image field as a view — the view half of the hosts'
 * RecipeImageField, landing the contract Stephen approved on
 * #124 ("Props in, callbacks out; the DS does not call the
 * picker library") and retiring RecipeFormPage's interim
 * `renderImageSection` slot for hosts that adopt the data
 * prop.
 *
 * The view owns the field's chrome: the labeled preview frame
 * (the current image through Thumbnail's hero treatment, or
 * the empty-state line) and the action row — pick, optional
 * take-photo, optional AI generate, and remove while a
 * preview shows. Busy presentation is the hosts' own: while
 * an upload or generation is in flight the pick / generate
 * actions read "Uploading…" / "Generating…" and every action
 * disables.
 *
 * Everything else stays with the host, exactly as the #124
 * decision drew it: the picker invocation itself, file
 * validation, the pending-selection crop flow, paste / drop
 * staging, the upload, and the AI call. Those report back
 * through the props above — a finished upload lands as a new
 * `imagePreviewUri`, a failure as `error`.
 */
export function RecipeImageView({
  label = "Recipe image",
  imagePreviewUri,
  isUploading = false,
  isGenerating = false,
  error,
  canGenerateImage = true,
  emptyMessage = "Choose an image from your library or generate one with AI",
  headerAction,
  onPickImageRequest,
  onTakePhotoRequest,
  onGenerateImageRequest,
  onRemoveImage,
}: RecipeImageViewProps) {
  const busy = isUploading || isGenerating;
  return (
    <LabeledGroup label={label} action={headerAction}>
      <YStack gap="$3">
        {imagePreviewUri ? (
          <Thumbnail src={imagePreviewUri} variant="hero" accessibilityLabel="Recipe preview" />
        ) : (
          <YStack
            overflow="hidden"
            borderRadius={tokens.radii.md}
            borderWidth={2}
            borderStyle="dashed"
            borderColor={tokens.colors.gray.gray4}
            backgroundColor={tokens.colors.gray.gray1}
            paddingVertical="$6"
            alignItems="center"
          >
            <Text variant="hint">{emptyMessage}</Text>
          </YStack>
        )}
        <ButtonRow>
          <Button variant="primary" disabled={busy} onPress={onPickImageRequest}>
            {isUploading ? "Uploading…" : "Browse images"}
          </Button>
          {onTakePhotoRequest ? (
            <Button variant="secondary" disabled={busy} onPress={onTakePhotoRequest}>
              Take photo
            </Button>
          ) : null}
          {onGenerateImageRequest ? (
            <Button
              variant="secondary"
              accessibilityLabel="Generate image with AI"
              disabled={busy || !canGenerateImage}
              onPress={onGenerateImageRequest}
            >
              {isGenerating ? "Generating…" : "Generate with AI"}
            </Button>
          ) : null}
          {imagePreviewUri ? (
            <Button variant="secondary" disabled={busy} onPress={onRemoveImage}>
              Remove image
            </Button>
          ) : null}
        </ButtonRow>
        {error ? <Alert severity="error" message={error} /> : null}
      </YStack>
    </LabeledGroup>
  );
}
