import { Text, type TextProps } from "./Text.js";

export type CenteredTextProps = TextProps & {
  /** Muted ink (the theme's $textMuted) instead of the default
   * foreground — for subtitles and other secondary centered
   * lines. */
  muted?: boolean;
};

/**
 * A line of text centered in its container (#119): a page
 * subtitle under a left-aligned title, a lone empty-list
 * message. Centering is the component's whole treatment — the
 * text's size and weight stay the caller's choice through
 * Text's variants — so pages render centered lines without
 * setting textAlign themselves. For centering a whole block of
 * mixed content, compose Center instead; this is for the text
 * line itself (each wrapped line centers, which a centered
 * flex item would not do).
 *
 * The recipedetail tranche's StatusMessage was folded in here
 * by the #119 dedupe (cluster B8) as a static centered line, and
 * ships separately again since #318: a transient action
 * confirmation needs an always-mounted polite live region,
 * which a static centered line must not carry (every subtitle
 * would become a live region). StatusMessage owns that
 * announcer contract; this component stays the static line.
 */
export function CenteredText({ muted = false, ...rest }: CenteredTextProps) {
  return <Text textAlign="center" {...(muted ? { color: "$textMuted" } : {})} {...rest} />;
}
