import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledText = styled(TamaguiText, {
  name: "Text",

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

export type TextProps = StyledTextProps & {
  variant?: "heading" | "subheading" | "body" | "hint" | "error" | "verse";
};

/**
 * Token-driven text primitive. Variants: `heading`, `subheading`, `body`
 * (default), `hint` (muted caption), `error`, and `verse` (serif reading
 * text for scripture/long-form content).
 */
export function Text({ variant = "body", ...rest }: TextProps) {
  // The font family must cross as an instance prop carrying the
  // BARE font name ("body" / "verse", no "$"): on web, Tamagui only
  // records the font — and so only emits the font-context class
  // (`font_body` / `font_verse`) that defines `--f-family` — when a
  // text component receives a `fontFamily` whose value is a
  // registered font name in exactly that form (Tamagui's own
  // SizableText is built this way, with the bare name body). The
  // "$verse" form, whether in a styled() variant or as a prop,
  // produces only a `font-family: var(--f-family)` utility with no
  // context class to define the variable, so the text silently
  // inherited whatever family the surrounding page happened to use
  // (a browser/RNW default), while fonted primitives (Input, Label)
  // rendered in the theme stack. That mismatch is #69: parts of a
  // page in one family, the rest in another. With the bare name,
  // body text renders in the registered body font and `verse` text
  // in the registered verse font, the way the apps' screens render.
  // A caller-passed `fontFamily` in `rest` still wins.
  return (
    <StyledText variant={variant} fontFamily={variant === "verse" ? "verse" : "body"} {...rest} />
  );
}
