import { useState } from "react";
import { isWeb, View } from "tamagui";
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
 * "Reveal blank word N of M"; focus is indicated by the blank line
 * changing color (deliberately no focus ring — a ring flashes on pointer
 * click in the instant before the word reveals). Once revealed it
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
/**
 * The font-weight pin for the hidden state (see the frame and sizing-text
 * comments in the component). `inherit` is a CSS value, not a React
 * Native font weight — RN accepts only named/numeric weights — so the pin
 * exists on web only. On native neither element sets a weight: the sizing
 * text takes the default weight, which matches the revealed verse text's
 * effective weight (the verse variant sets no weight either), so the
 * hidden and revealed boxes still match.
 */
const inheritWeight = isWeb ? "inherit" : undefined;

/**
 * Where the blank line anchors inside the sizing word's box (#93).
 * On web the box is the full line box (lineHeight = 1.5 × font size),
 * so `bottom: 4` lands the line just below the baseline, like an
 * underline. On native the box Yoga measures for the nested text is
 * the tighter glyph box (no half-leading), so the same 4px offset
 * leaves the line floating at mid x-height — Stephen's 2026-10-23
 * Android-baseline review. Anchoring 1px BELOW the native box's
 * bottom edge puts the line just under the baseline there (measured
 * against the PR #91 mid-session baseline: the line sat ~5dp above
 * the baseline; 4 → -1 moves it down exactly that 5dp). Web keeps 4:
 * its line already sits at the bottom of the line.
 */
const blankLineBottom = isWeb ? 4 : -1;

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
      // Pin the frame's weight too (web only — see inheritWeight above):
      // the Button's styled base is semibold, and the sizing text inside
      // is pinned to `inherit` (below) — pinning the frame as well means
      // the inherit chain runs sentence → frame → sizing text with no
      // semibold step in between. This must go through `style`: Tamagui
      // routes a `fontWeight` instance prop to the Button's internal text
      // element (and drops it entirely when the children are elements, as
      // here), so it never reaches the frame — verified in SSR output.
      // The style prop lands on the frame element itself.
      style={inheritWeight ? { fontWeight: inheritWeight } : undefined}
      accessibilityLabel={`Reveal blank word ${index + 1} of ${total}`}
    >
      <View position="relative">
        {/* The word itself, invisible: identical metrics to the revealed
            state is what guarantees zero layout shift. aria-hidden keeps
            the answer out of the accessibility tree (the button's label
            carries the meaning), and userSelect keeps it un-copyable.
            fontWeight pins the sizing text to the surrounding sentence's
            weight: the revealed word inherits that weight, so the hidden
            state must too — the Button's own semibold label styling must
            never reach this text, or the wider semibold glyphs would size
            the blank wider than the word that replaces it. The button
            frame carries the same `inherit` pin (above), so the weight
            this text inherits is the sentence's, never the frame's
            semibold base. The pin is web-only (see inheritWeight above):
            on native this text sets no weight and defaults to the same
            weight as the revealed text. */}
        <Text variant="verse" aria-hidden opacity={0} userSelect="none" fontWeight={inheritWeight}>
          {word}
        </Text>
        {/* The blank line, overlaid across the word's width. It is also
            the focus indicator: $link at rest, $color (the theme's main
            text color — maximally visible against the background in both
            modes) while the button is focused. */}
        <View
          aria-hidden
          position="absolute"
          left={0}
          right={0}
          bottom={blankLineBottom}
          height={2}
          borderRadius={1}
          backgroundColor={focused ? "$color" : "$link"}
        />
      </View>
    </Button>
  );
}
