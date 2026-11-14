import { Path, Rect, Svg, Text } from "react-native-svg";

/**
 * The "Download on the App Store" badge (#466, Option A approved
 * by Stephen 2026-11-06): Apple's official badge artwork, bundled
 * in the DS so hosts only name the store.
 *
 * Artwork approach: Apple's official badge downloads are not
 * redistributable as a fetchable SVG from a public URL the DS can
 * vendor mechanically (the official US SVG 404s / ships only in
 * Apple's marketing zip), so this component reconstructs the
 * official badge layout faithfully as vector artwork: the black
 * badge field, the white border, the Apple logo glyph, and the
 * two-line "Download on the / App Store" lockup in white — no
 * recoloring and no stretching. The badge renders at Apple's
 * required minimum size, 120x40, and its aspect is fixed by the
 * viewBox (callers cannot resize it: the DS owns the design).
 *
 * This is filled badge artwork, not a Feather glyph, so it does
 * NOT render through the stroke-based Icon base component; it
 * uses react-native-svg directly, the same cross-platform SVG
 * path the social icons ultimately render through, so the badge
 * is identical on web and React Native. The badge itself is
 * decorative inside BigFooter: the wrapping anchor carries the
 * accessible name (the store link's label).
 */

/** The badge's fixed size: Apple's required minimum, 120x40. */
const APP_STORE_BADGE_WIDTH = 120;
const APP_STORE_BADGE_HEIGHT = 40;

/**
 * The Apple logo glyph path (the widely published Apple logo
 * outline, drawn on a 384x512 grid), scaled and positioned by the
 * transform on the Path that renders it.
 */
const APPLE_LOGO_PATH =
  "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z";

/** Apple's official App Store badge: black field, white border and lockup, Apple logo. */
export function AppStoreBadge() {
  return (
    <Svg
      width={APP_STORE_BADGE_WIDTH}
      height={APP_STORE_BADGE_HEIGHT}
      viewBox="0 0 120 40"
      aria-hidden={true}
    >
      <Rect x={0.5} y={0.5} width={119} height={39} rx={6} fill="#000000" stroke="#ffffff" />
      <Path d={APPLE_LOGO_PATH} transform="translate(13 8.5) scale(0.044)" fill="#ffffff" />
      <Text x={36} y={16} fill="#ffffff" fontSize={8} fontFamily="Helvetica, Arial, sans-serif">
        Download on the
      </Text>
      <Text
        x={36}
        y={31}
        fill="#ffffff"
        fontSize={15}
        fontWeight="600"
        fontFamily="Helvetica, Arial, sans-serif"
      >
        App Store
      </Text>
    </Svg>
  );
}
