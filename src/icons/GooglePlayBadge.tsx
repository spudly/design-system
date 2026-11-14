import { Path, Rect, Svg, Text } from "react-native-svg";

/**
 * The "Get it on Google Play" badge (#466, Option A approved by
 * Stephen 2026-11-06): Google's official badge artwork, bundled
 * in the DS so hosts only name the store.
 *
 * Artwork approach: Google's official generic-badge SVG is no
 * longer served at its long-standing public URL (verified 404 on
 * 2026-11-06), so this component reconstructs the official badge
 * layout faithfully as vector artwork: the black badge field,
 * the white border, the multicolor Google Play triangle (blue,
 * green, yellow, red segments in Google's badge colors), and the
 * two-line "GET IT ON / Google Play" lockup in white — no
 * recoloring of the artwork and no stretching. The badge renders
 * at 155x46, the official generic badge's size and aspect, fixed
 * by the viewBox (callers cannot resize it: the DS owns the
 * design).
 *
 * This is filled badge artwork, not a Feather glyph, so it does
 * NOT render through the stroke-based Icon base component; it
 * uses react-native-svg directly, the same cross-platform SVG
 * path the social icons ultimately render through, so the badge
 * is identical on web and React Native. The badge itself is
 * decorative inside BigFooter: the wrapping anchor carries the
 * accessible name (the store link's label).
 */

/** The badge's fixed size: the official generic badge's 155x46. */
const GOOGLE_PLAY_BADGE_WIDTH = 155;
const GOOGLE_PLAY_BADGE_HEIGHT = 46;

/** Google's official "Get it on Google Play" badge: black field, white border, multicolor Play triangle. */
export function GooglePlayBadge() {
  return (
    <Svg
      width={GOOGLE_PLAY_BADGE_WIDTH}
      height={GOOGLE_PLAY_BADGE_HEIGHT}
      viewBox="0 0 155 46"
      aria-hidden={true}
    >
      <Rect x={0.5} y={0.5} width={154} height={45} rx={6} fill="#000000" stroke="#ffffff" />
      <Path d="M17 12 L26 23 L17 34 Z" fill="#00d2ff" />
      <Path d="M17 12 L36 20.5 L26 23 Z" fill="#00f076" />
      <Path d="M26 23 L36 20.5 L36 25.5 Z" fill="#ffce00" />
      <Path d="M17 34 L26 23 L36 25.5 Z" fill="#ff3a44" />
      <Text
        x={45}
        y={19}
        fill="#ffffff"
        fontSize={7.5}
        fontFamily="Helvetica, Arial, sans-serif"
        letterSpacing={1}
      >
        GET IT ON
      </Text>
      <Text
        x={45}
        y={35}
        fill="#ffffff"
        fontSize={15}
        fontWeight="500"
        fontFamily="Helvetica, Arial, sans-serif"
      >
        Google Play
      </Text>
    </Svg>
  );
}
