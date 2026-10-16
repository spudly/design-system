import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import type { ReactNode } from "react";
import { tokens } from "../tokens/index.js";

const StyledTextLink = styled(TamaguiText, {
  name: "SpudlyTextLink",

  color: "$link",
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  // Underlined by default so the link is identifiable without hover —
  // the old ui-link underlined only on web hover, which native never sees.
  textDecorationLine: "underline",
});

type StyledTextLinkProps = GetProps<typeof StyledTextLink>;

export interface TextLinkProps extends Omit<StyledTextLinkProps, "onPress"> {
  /** Press handler — a link always navigates or triggers an action. */
  onPress: () => void;
  children: ReactNode;
}

/**
 * Inline semantic link for use inside prose: link-colored (the `$link`
 * semantic token, which carries AA-contrast light/dark values), medium-weight
 * text with an underline affordance and `accessibilityRole="link"`. Use
 * this instead of a ghost Button when the action sits within a sentence
 * (legal links, "forgot password", inline references). Text styling can be
 * adjusted through the usual Tamagui text props.
 */
export function TextLink({ onPress, children, ...rest }: TextLinkProps) {
  // Web keyboard support: with no href, link semantics alone do not make
  // the text keyboard-operable, so it is made focusable and Enter (the link
  // activation key) invokes the same callback as a press. `tabIndex` and
  // `onKeyDown` are web-only props in Tamagui and are ignored on native,
  // where onPress is the activation path. A caller's own tabIndex/onKeyDown
  // (via rest) overrides these defaults.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <StyledTextLink
      accessibilityRole="link"
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      $platform-web={{ cursor: "pointer" }}
      {...rest}
    >
      {children}
    </StyledTextLink>
  );
}
