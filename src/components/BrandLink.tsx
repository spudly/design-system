import { Text } from "./Text.js";
import { tokens } from "../tokens/index.js";

export type BrandLinkProps = {
  /** The wordmark text — the caller's brand name, as content. */
  label: string;
  /** Brand intent: the host navigates to its home. */
  onPress: () => void;
};

/**
 * The brand wordmark link (#119): a link-styled pressable that
 * carries the link role and web keyboard activation (Enter), like
 * TextLink, but in the brand treatment (primary ink, semibold,
 * no underline) a site header uses for its wordmark. Extracted
 * from PublicPageFrame for the #119 page de-styling program, so
 * chrome composes the wordmark without setting text styling
 * itself.
 *
 * Callback form only, on purpose: the wordmark sits in chrome
 * whose navigation is intent-callback driven (the public frame's
 * contract, #169). A surface whose brand navigates by href
 * renders its own anchor treatment (LegalDocumentPage's frame,
 * #170) — the two frames' contracts differ deliberately.
 */
export function BrandLink({ label, onPress }: BrandLinkProps) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <Text
      fontSize={tokens.typography.fontSize.lg}
      fontWeight={tokens.typography.fontWeight.semibold}
      color="$primary"
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {label}
    </Text>
  );
}
