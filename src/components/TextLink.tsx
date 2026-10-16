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
  return (
    <StyledTextLink
      accessibilityRole="link"
      onPress={onPress}
      $platform-web={{ cursor: "pointer" }}
      {...rest}
    >
      {children}
    </StyledTextLink>
  );
}
