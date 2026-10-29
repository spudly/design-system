import { Anchor, View, XStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

/**
 * The back arrow must NOT be the "←" text glyph. Its ink is not
 * centered inside its own em box — on Android it renders at the
 * bottom of the line box, so the arrow sat visibly below the label's
 * vertical center in the page stories (Stephen, reviewing the PR #91
 * Android VR baselines, 2026-10-23; design-system#95). It is the same
 * glyph bug class as the SearchField search icon (#45 / eciperay#162):
 * no font size or lineHeight centers asymmetric ink, and an explicit
 * lineHeight is the banned #162 mechanism. BackArrow below draws the
 * arrow from fixed-dimension shapes inside a fixed 20px box, so the
 * row's flex centering centers the arrow itself, identically on web
 * and native. Do not reintroduce a text glyph for this arrow.
 */
function BackArrow() {
  return (
    <View aria-hidden position="relative" width={20} height={20} flexShrink={0}>
      {/* Shaft: a horizontal bar through the box's vertical center. */}
      <View
        position="absolute"
        left={3}
        top={8.75}
        width={14}
        height={2.5}
        borderRadius={1.25}
        backgroundColor="$link"
      />
      {/* Arrowhead: two bars rotated ±45°, their left ends meeting at
          the shaft's left end, forming the chevron point. */}
      <View
        position="absolute"
        left={1.8}
        top={5.9}
        width={8}
        height={2.5}
        borderRadius={1.25}
        backgroundColor="$link"
        rotate="-45deg"
      />
      <View
        position="absolute"
        left={1.8}
        top={11.6}
        width={8}
        height={2.5}
        borderRadius={1.25}
        backgroundColor="$link"
        rotate="45deg"
      />
    </View>
  );
}

/**
 * The href form's frame (#248): the same row geometry as the
 * callback form's XStack (centered row, 44px minimum height, same
 * padding and gap), carried by a Tamagui Anchor — a real `<a href>`
 * on web; on native a press opens the href through the platform
 * link path (Tamagui's Anchor calls Linking.openURL internally, so
 * no DS component imports react-native). The drawn arrow and the
 * label render inside it unchanged, so both forms are one control
 * with one layout.
 *
 * The web display is pinned to flex explicitly: Anchor is a
 * text-based component (Tamagui's Anchor frame is a styled
 * SizableText rendering an `<a>`), and Tamagui's text base style is
 * `display: inline` on web — an inline anchor silently ignores the
 * row's flexDirection/gap/alignItems and does not reliably hold
 * the 44px minimum height (verified in the SSR-generated CSS for
 * this component: the flex classes were emitted with no display
 * class at all). The v3 flat `web:` clause (the ScreenContainer
 * pattern) scopes the flex display to web; native is unchanged.
 */
const StyledBackAnchor = styled(Anchor, {
  name: "BackLinkAnchor",

  // A web anchor carries the UA link underline; the callback
  // form's row has none, and the two forms are contracted to look
  // identical (manual Storybook QA finding on PR #283).
  textDecorationLine: "none",
  display: "web:flex",
  alignItems: "center",
  alignSelf: "flex-start",
  flexDirection: "row",
  gap: tokens.spacing[2],
  minHeight: 44,
  paddingHorizontal: tokens.spacing[2],
});

export type BackLinkProps =
  | {
      /** Navigate back — the callback form, for hosts whose back navigation is callback-driven (e.g. "wherever the user came from"). */
      onPress: () => void;
      href?: never;
      /** Link label. Defaults to "Back", the apps' back-link copy. */
      label?: string;
    }
  | {
      /**
       * The back destination as an href — the link form, for hosts
       * with a canonical back destination (sign-in, the recipe
       * page): renders a real anchor carrying the href on web.
       * Native contract (shared by every DS href form): the href
       * is forwarded verbatim to the platform link path
       * (`Linking.openURL`), which requires a scheme-bearing URL
       * an installed app can open — so on native the host passes
       * an absolute URL (the app's deep-link scheme or an https
       * URL); root-relative paths such as "/recipes" are
       * web-form destinations. The design system has no base URL
       * or router to resolve a relative path against, so composing
       * the per-platform destination is the host's part of the
       * contract (the host composes hrefs from its routes, #248).
       */
      href: string;
      onPress?: never;
      /** Link label. Defaults to "Back", the apps' back-link copy. */
      label?: string;
    };

/**
 * The shared back link for page tops: a drawn left arrow plus a label,
 * laid out as one pressable row whose `alignItems: "center"` centers
 * the arrow against the label by construction (#95). Before this
 * component existed, pages rendered the back affordance inline as a
 * ghost Button carrying the "←" text glyph, whose ink rode at the
 * bottom of the line on Android. Pages use this component so every
 * back link inherits the correction.
 *
 * Two forms (#248's navigation rule): pass `href` when the back
 * destination is a canonical page (the link form — a real anchor on
 * web), or `onPress` when the host's back navigation is
 * callback-driven.
 *
 * Accessibility: exposes `accessibilityRole="link"` (a member of
 * React Native's supported role set — see
 * test/accessibilityRoles.test.mjs) and a 44px minimum touch height.
 * The href form's anchor is keyboard-operable by default on web;
 * the callback form is focusable and Enter activates it, like
 * TextLink (with no href, link semantics alone are not
 * keyboard-operable).
 */
export function BackLink(props: BackLinkProps) {
  const { label = "Back" } = props;
  if (props.href !== undefined) {
    return (
      <StyledBackAnchor href={props.href} cursor="web:pointer">
        <BackArrow />
        <Text color="$link" fontWeight={tokens.typography.fontWeight.semibold}>
          {label}
        </Text>
      </StyledBackAnchor>
    );
  }
  const { onPress } = props;
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <XStack
      {...platformAccessibilityProps({ accessibilityRole: "link" })}
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
      alignItems="center"
      alignSelf="flex-start"
      gap={tokens.spacing[2]}
      minHeight={44}
      paddingHorizontal={tokens.spacing[2]}
    >
      <BackArrow />
      <Text color="$link" fontWeight={tokens.typography.fontWeight.semibold}>
        {label}
      </Text>
    </XStack>
  );
}
