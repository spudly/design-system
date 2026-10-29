import { Anchor, Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import type { ReactNode } from "react";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The text link's styling: ONE config shared by the two frames
 * TextLink renders, so the forms cannot drift:
 *
 * - `StyledTextLink` (the callback form): a Tamagui Text with press
 *   handling — focusable and Enter-activated on web, since link
 *   semantics alone are not keyboard-operable without an href.
 * - `StyledTextAnchor` (the href form, #248): a Tamagui Anchor —
 *   renders a real `<a href>` on web (keyboard-operable by default);
 *   on native a press opens the href through the platform link path
 *   (Tamagui's Anchor calls Linking.openURL internally, so no DS
 *   component imports react-native).
 */
const textLinkFrameConfig = {
  color: "$link",
  fontSize: tokens.typography.fontSize.md,
  fontWeight: tokens.typography.fontWeight.medium,
  // Underlined by default so the link is identifiable without hover —
  // the old ui-link underlined only on web hover, which native never sees.
  textDecorationLine: "underline",
} as const;

const StyledTextLink = styled(TamaguiText, {
  name: "TextLink",
  ...textLinkFrameConfig,
});

const StyledTextAnchor = styled(Anchor, {
  name: "TextLinkAnchor",
  ...textLinkFrameConfig,
});

type StyledTextLinkProps = GetProps<typeof StyledTextLink>;

/**
 * TextLink's own props, minus the activation entries: `onPress` and
 * `href` are the two forms' discriminants, declared per shape in
 * TextLinkProps below (and destructured by the wrapper, so an href
 * can never leak onto the callback form's element).
 */
type TextLinkOwnProps = Omit<StyledTextLinkProps, "onPress" | "href"> & {
  children: ReactNode;
};

export type TextLinkProps =
  | (TextLinkOwnProps & {
      /**
       * Press handler — the callback form, for hosts whose
       * navigation is callback-driven (e.g. in-app routing on
       * native). DS pages use the href form for navigation (#248).
       */
      onPress: () => void;
      href?: never;
    })
  | (TextLinkOwnProps & {
      /**
       * The link's destination: renders a real anchor carrying the
       * href on web; on native a press opens it through the
       * platform link path. This is the navigation form — a control
       * that navigates to another page is a link with an href
       * (#248); in-page actions are buttons (see TextAction).
       * Native contract (shared by every DS href form): the href
       * is forwarded verbatim to `Linking.openURL`, which requires
       * a scheme-bearing URL an installed app can open — so on
       * native the host passes an absolute URL (the app's
       * deep-link scheme or an https URL); root-relative paths
       * such as "/forgot-password" are web-form destinations. The
       * design system has no base URL or router to resolve a
       * relative path against, so composing the per-platform
       * destination is the host's part of the contract (the host
       * composes hrefs from its routes, #248).
       */
      href: string;
      onPress?: never;
    });

/**
 * The widened field set the component renders from. The public
 * `TextLinkProps` union keeps the two activation forms mutually
 * exclusive at call sites; the members agree on every shared
 * field's type, so rendering reads them through this one shape.
 */
type TextLinkRenderProps = TextLinkOwnProps & {
  onPress?: () => void;
  href?: string;
};

/**
 * Inline semantic link for use inside prose: link-colored (the `$link`
 * semantic token, which carries AA-contrast light/dark values), medium-weight
 * text with an underline affordance and `accessibilityRole="link"`. Use
 * this instead of a ghost Button when the navigation sits within a sentence
 * (legal links, "forgot password", inline references). Text styling can be
 * adjusted through the usual Tamagui text props.
 *
 * Pass `href` for navigation (a real anchor on web); pass `onPress`
 * only where the host's navigation is callback-driven.
 */
export function TextLink(props: TextLinkProps) {
  const {
    onPress,
    href,
    children,
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityState,
    accessibilityValue,
    ...rest
  } = props as TextLinkRenderProps;
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? "link",
    accessibilityState,
    accessibilityValue,
  });
  if (href !== undefined) {
    // A real anchor is keyboard-operable by default on web — no
    // tabIndex/key handler shim (the callback form's, below) needed.
    return (
      <StyledTextAnchor {...a11yProps} href={href} cursor="web:pointer" {...rest}>
        {children}
      </StyledTextAnchor>
    );
  }
  // Web keyboard support: with no href, link semantics alone do not make
  // the text keyboard-operable, so it is made focusable and Enter (the link
  // activation key) invokes the same callback as a press. `tabIndex` and
  // `onKeyDown` are web-only props in Tamagui and are ignored on native,
  // where onPress is the activation path. A caller's own tabIndex/onKeyDown
  // (via rest) overrides these defaults.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress?.();
    }
  };
  return (
    <StyledTextLink
      {...a11yProps}
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
      {...rest}
    >
      {children}
    </StyledTextLink>
  );
}
