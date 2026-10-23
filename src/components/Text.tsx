import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledText = styled(TamaguiText, {
  name: "SpudlyText",

  color: "$color",
  fontSize: tokens.typography.fontSize.md,

  variants: {
    variant: {
      heading: {
        fontSize: tokens.typography.fontSize["3xl"],
        fontWeight: tokens.typography.fontWeight.bold,
      },
      subheading: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeight.semibold,
      },
      body: {
        // Base styles above; no overrides.
      },
      hint: {
        fontSize: tokens.typography.fontSize.sm,
        color: "$textMuted",
      },
      error: {
        fontSize: tokens.typography.fontSize.sm,
        color: "$errorText",
      },
      verse: {
        fontSize: tokens.typography.fontSize.lg,
        // The registered `verse` font (base serif stack; Alegreya
        // under Quiet Dawn, #66) — see VerseText.
        fontFamily: "$verse",
      },
    },
  } as const,

  defaultVariants: {
    variant: "body",
  },
});

type StyledTextProps = GetProps<typeof StyledText>;

export interface TextProps extends StyledTextProps {
  variant?: "heading" | "subheading" | "body" | "hint" | "error" | "verse";
}

/**
 * Token-driven text primitive. Variants: `heading`, `subheading`, `body`
 * (default), `hint` (muted caption), `error`, and `verse` (serif reading
 * text for scripture/long-form content).
 */
export function Text({ variant = "body", ...rest }: TextProps) {
  return <StyledText variant={variant} {...rest} />;
}
