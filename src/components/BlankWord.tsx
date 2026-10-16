import { useState } from "react";
import { View } from "tamagui";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export interface BlankWordProps {
  /** The word shown once revealed. */
  word: string;
  revealed: boolean;
  onReveal: () => void;
  /** Zero-based position of this blank in the drill. */
  index: number;
  /** Total number of blanks in the drill. */
  total: number;
}

/**
 * Fill-in-the-blank word for memorization drills. While hidden this is a
 * genuine keyboard-focusable button (not a div with onClick) labeled
 * "Reveal blank word N of M", with a visible focus ring. Once revealed it
 * becomes plain text labeled "Revealed: <word>" so the state change is
 * announced.
 *
 * The hidden control is sized BY the word itself: it renders the word
 * invisibly (same verse text metrics as the revealed state) with a blank
 * line overlaid, and no fill — so hidden and revealed occupy exactly the
 * same box and toggling never shifts the surrounding sentence. The cost
 * is touch-target size: the control is now word-sized (about 27px tall,
 * word-width wide) rather than the usual 44px minimum — accepted
 * deliberately, because a 44px box in the middle of a sentence is what
 * caused the layout shift this component must not have.
 */
export function BlankWord({ word, revealed, onReveal, index, total }: BlankWordProps) {
  const [focused, setFocused] = useState(false);

  if (revealed) {
    return (
      <Text variant="verse" accessibilityLabel={`Revealed: ${word}`}>
        {word}
      </Text>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      // Flow inline within the surrounding sentence on web (Tamagui
      // buttons are display:flex, which block-ifies in text flow), and
      // hug the left edge like the revealed text instead of stretching
      // full-width with centered content. The web-only display uses
      // Tamagui v3's conditional-object syntax — the v2 `$platform-web`
      // prop was removed in v3 and is silently dropped.
      display={{ web: "inline-flex" }}
      alignSelf="flex-start"
      onPress={onReveal}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // No fill and no chrome: the blank line below is the affordance.
      // The ghost hover/press treatments still apply on interaction.
      backgroundColor="transparent"
      borderColor="transparent"
      borderWidth={0}
      // The box is exactly the word's box — no padding in either axis
      // (the `sm` variant otherwise adds 8px top and bottom, growing the
      // hidden state 16px taller than the revealed text), no min-height.
      paddingHorizontal={0}
      paddingVertical={0}
      minHeight={0}
      outlineWidth={focused ? 2 : 0}
      outlineStyle="solid"
      // $link is the interactive-affordance role: same value as $primary
      // in the light themes, a brighter step in dark (where $primary
      // drops under 3:1 against the dark background).
      outlineColor="$link"
      outlineOffset={2}
      accessibilityLabel={`Reveal blank word ${index + 1} of ${total}`}
    >
      <View position="relative">
        {/* The word itself, invisible: identical metrics to the revealed
            state is what guarantees zero layout shift. aria-hidden keeps
            the answer out of the accessibility tree (the button's label
            carries the meaning), and userSelect keeps it un-copyable. */}
        <Text variant="verse" aria-hidden opacity={0} userSelect="none">
          {word}
        </Text>
        {/* The blank line, overlaid across the word's width. */}
        <View
          aria-hidden
          position="absolute"
          left={0}
          right={0}
          bottom={4}
          height={2}
          borderRadius={1}
          backgroundColor="$link"
        />
      </View>
    </Button>
  );
}
