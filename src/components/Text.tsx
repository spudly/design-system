import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

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
      title: {
        fontSize: tokens.typography.fontSize.xl,
        fontWeight: tokens.typography.fontWeight.bold,
      },
      formTitle: {
        fontSize: tokens.typography.fontSize["2xl"],
        fontWeight: tokens.typography.fontWeight.bold,
      },
      label: {
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        letterSpacing: 0.3,
        textTransform: "uppercase",
        color: tokens.colors.gray.gray6,
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
  variant?:
    | "heading"
    | "title"
    | "formTitle"
    | "subheading"
    | "body"
    | "hint"
    | "error"
    | "label"
    | "verse";
  // A caller-supplied heading level for the web target (routed
  // through platformAccessibilityProps and dropped on native, where
  // RN has no heading-level prop).
  "aria-level"?: number | undefined;
};

/**
 * Token-driven text primitive. Variants: `heading`, `title` (a compact
 * page title — xl bold, for detail screens whose title sits above a
 * meta block rather than opening a list), `formTitle` (the form-flow
 * page title — 2xl bold, for the import/form screens whose titles sit
 * inside the form layout rather than opening a page), `subheading`,
 * `body` (default), `hint` (muted caption), `error`, `label` (the
 * section eyebrow — xs semibold, uppercase, letter-spaced, muted gray),
 * and `verse` (serif reading text for scripture/long-form content).
 *
 * Accessibility props go through `platformAccessibilityProps` (#235),
 * the same translation as Button: text is a pressable path too
 * (TextAction, TextLink, BackLink carry `accessibilityRole="button"`
 * and callers' `accessibilityLabel`s), and Tamagui's web renderer
 * would otherwise leak the RN props to the DOM as raw attributes with
 * no accessible name. On native they pass through unchanged; a
 * caller-passed ARIA prop in `rest` still wins on web.
 */
export function Text({
  variant = "body",
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  "aria-level": callerAriaLevel,
  ...rest
}: TextProps) {
  // Heading semantics (#256): the `heading`, `title`, `formTitle`,
  // and `subheading` variants are page/section titles, so they carry
  // the RN `header` role by default — on web the translator renders
  // it as `role="heading"` with `aria-level` 1
  // (heading/title/formTitle) / 2 (subheading),
  // and on native the `header` role alone gives VoiceOver/TalkBack
  // heading navigation, with visuals unchanged. A caller-supplied
  // role (RN `accessibilityRole` or web `role` in rest) always wins;
  // the level is only attached when the effective role is a heading.
  // A caller-supplied `aria-level` is destructured out of rest and
  // routed through the translator like the generated level: left in
  // rest it would spread after a11yProps at render, so an explicit
  // `aria-level={undefined}` would clobber the generated level on
  // web and a defined level would bypass the translator's native
  // filter (RN has no heading-level prop; it is dropped there).
  const headingLevel =
    variant === "heading" || variant === "title" || variant === "formTitle"
      ? 1
      : variant === "subheading"
        ? 2
        : undefined;
  // The web `role` in rest spreads last at render (below), so when
  // both role props are supplied it is the role that actually
  // renders — check it first, or a rendered button would keep a
  // heading's aria-level (and a rendered heading would lose its).
  const callerRole = (rest as { role?: string }).role ?? accessibilityRole;
  const roleIsHeading =
    callerRole === undefined || callerRole === "header" || callerRole === "heading";
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? (headingLevel !== undefined ? "header" : undefined),
    accessibilityState,
    accessibilityValue,
    "aria-level":
      callerAriaLevel ?? (headingLevel !== undefined && roleIsHeading ? headingLevel : undefined),
  });
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
    <StyledText
      variant={variant}
      fontFamily={variant === "verse" ? "verse" : "body"}
      {...a11yProps}
      {...rest}
    />
  );
}
