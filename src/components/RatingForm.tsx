import { useState } from "react";
import { TextArea as TamaguiTextArea, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { StarRatingInput } from "./StarRatingInput.js";
import { Text } from "./Text.js";

const NotesArea = styled(TamaguiTextArea, {
  name: "RatingFormNotesArea",

  borderRadius: tokens.radii.xl,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[3],
  fontSize: tokens.typography.fontSize.md,
});

export interface RatingFormValues {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
}

export interface RatingFormProps {
  onSubmit: (values: RatingFormValues) => void;
  onSkip: () => void;
  isPending: boolean;
  variant?: "dark" | "light";
  secondaryLabel?: string;
  title?: string;
  notesPlaceholder?: string;
}

/**
 * RatingForm (#176 — generalized from the cook-log form that
 * shipped as CookLogForm under #126, B3c contract proposals,
 * option A): a generic star-rating plus free-text notes form.
 * Nothing about it is specific to any one app or domain: the
 * heading and the notes placeholder are props (with neutral
 * defaults), and the submit view-model carries a plain
 * `rating`, so any "rate this and leave a note" surface can
 * use it — a cook log, a session review, a purchase rating.
 *
 * The rating and notes are internal view state (uncontrolled):
 * only the submit view-model crosses the boundary —
 * `onSubmit({ rating, notes })` with the notes trimmed and
 * empty notes crossing as null. The rating is optional:
 * submitting with no stars sends `rating: null`. Pressing
 * the current star clears the rating (toggle-off, owned by
 * the form that holds the state). `isPending` disables Save
 * (at half opacity); the secondary action stays live. The
 * stars render through the DS StarRatingInput as-is, in its
 * default colors.
 *
 * Variants: `light` (default chrome on light surfaces — the
 * gray ramp positionally: gray-50 -> step 1 card fill,
 * gray-200 -> step 3 borders, gray-300 -> step 4 field border,
 * gray-700 -> step 8 secondary label, gray-900 -> step 10
 * text; the notes field fills with the theme's surface) and
 * `dark`, which sits on a dark overlay surface: its
 * fills are the theme's $surface at 10% composed as layered
 * opacity (the MealCookingModePage precedent) instead of one
 * app theme's hex-alpha suffixes, so the form stays
 * theme-correct, and its text is the surface itself. The
 * dark placeholder uses the gray ramp's muted step — white
 * at 50% has no token. The notes field keeps variant-driven
 * chrome (the VersionPicker precedent), and the two action
 * halves are pressable stacks so they share identical chrome;
 * the save half is the semantic primary with its onPrimary
 * label.
 */
export function RatingForm({
  onSubmit,
  onSkip,
  isPending,
  variant = "dark",
  secondaryLabel = "Skip",
  title = "How did it go?",
  notesPlaceholder = "Notes (optional)",
}: RatingFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [notes, setNotes] = useState("");
  const isLight = variant === "light";

  const handleRatingChange = (star: number) => {
    setRating((current) => (current === star ? null : (star as 1 | 2 | 3 | 4 | 5)));
  };

  const handleSubmit = () => {
    onSubmit({ rating, notes: notes.trim() || null });
  };

  return (
    <YStack
      borderRadius={tokens.radii.xl}
      width="100%"
      backgroundColor={isLight ? tokens.colors.gray.gray1 : undefined}
      borderWidth={isLight ? 1 : undefined}
      borderColor={isLight ? tokens.colors.gray.gray3 : undefined}
    >
      {isLight ? null : (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius={tokens.radii.xl}
          backgroundColor="$surface"
          opacity={0.1}
        />
      )}
      <YStack padding="$6">
        <Text
          marginBlockEnd="$4"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.semibold}
          color={isLight ? tokens.colors.gray.gray10 : "$surface"}
        >
          {title}
        </Text>
        <YStack marginBlockEnd="$4" alignItems="center">
          <StarRatingInput value={rating ?? 0} onChange={handleRatingChange} />
        </YStack>
        <YStack marginBlockEnd="$4">
          {isLight ? null : (
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              borderRadius={tokens.radii.xl}
              backgroundColor="$surface"
              opacity={0.1}
            />
          )}
          <NotesArea
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder={notesPlaceholder}
            placeholderTextColor={tokens.colors.gray.gray5}
            backgroundColor={isLight ? "$surface" : "transparent"}
            borderWidth={isLight ? 1 : 0}
            borderColor={isLight ? tokens.colors.gray.gray4 : undefined}
            color={isLight ? tokens.colors.gray.gray10 : "$surface"}
          />
        </YStack>
        <XStack gap="$3">
          <YStack
            flex={1}
            alignItems="center"
            borderRadius={tokens.radii.xl}
            paddingVertical={tokens.spacing[3]}
            backgroundColor={isLight ? "$surface" : undefined}
            borderWidth={isLight ? 1 : undefined}
            borderColor={isLight ? tokens.colors.gray.gray3 : undefined}
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
            onPress={onSkip}
            cursor="pointer"
          >
            {isLight ? null : (
              <YStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius={tokens.radii.xl}
                backgroundColor="$surface"
                opacity={0.1}
              />
            )}
            <Text
              fontSize={tokens.typography.fontSize.md}
              color={isLight ? tokens.colors.gray.gray8 : "$surface"}
            >
              {secondaryLabel}
            </Text>
          </YStack>
          <YStack
            flex={1}
            alignItems="center"
            borderRadius={tokens.radii.xl}
            paddingVertical={tokens.spacing[3]}
            backgroundColor="$primary"
            opacity={isPending ? 0.5 : 1}
            accessibilityRole="button"
            accessibilityLabel="Save"
            accessibilityState={{ disabled: isPending }}
            onPress={isPending ? undefined : handleSubmit}
            cursor="pointer"
          >
            <Text
              fontSize={tokens.typography.fontSize.md}
              fontWeight={tokens.typography.fontWeight.semibold}
              color="$onPrimary"
            >
              Save
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
