import { View, XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
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

export interface BackLinkProps {
  /** Navigate back — a link always navigates. */
  onPress: () => void;
  /** Link label. Defaults to "Back", the apps' back-link copy. */
  label?: string;
}

/**
 * The shared back link for page tops: a drawn left arrow plus a label,
 * laid out as one pressable row whose `alignItems: "center"` centers
 * the arrow against the label by construction (#95). Before this
 * component existed, pages rendered the back affordance inline as a
 * ghost Button carrying the "←" text glyph, whose ink rode at the
 * bottom of the line on Android. Pages use this component so every
 * back link inherits the correction.
 *
 * Accessibility: exposes `accessibilityRole="link"` (a member of
 * React Native's supported role set — see
 * test/accessibility-roles.test.mjs) and a 44px minimum touch height.
 * On web it is focusable and Enter activates it, like TextLink (with
 * no href, link semantics alone are not keyboard-operable).
 */
export function BackLink({ onPress, label = "Back" }: BackLinkProps) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <XStack
      accessibilityRole="link"
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
