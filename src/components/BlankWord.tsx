import { useState } from "react";
import { tokens } from "../tokens/index.js";
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
 * "Reveal blank word N of M", with a visible focus ring and a 44px minimum
 * touch target. Once revealed it becomes plain text labeled
 * "Revealed: <word>" so the state change is announced.
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
      variant="secondary"
      size="sm"
      onPress={onReveal}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      minHeight={44}
      paddingHorizontal={tokens.spacing[3]}
      outlineWidth={focused ? 2 : 0}
      outlineStyle="solid"
      outlineColor={tokens.colors.primary.primary7}
      outlineOffset={2}
      accessibilityLabel={`Reveal blank word ${index + 1} of ${total}`}
    >
      _____
    </Button>
  );
}
