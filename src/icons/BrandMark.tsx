import { Circle, Path, Rect, Svg } from "react-native-svg";

/**
 * The DS-owned brand marks (#726): the graphic logo marks the
 * design system renders for the brands it knows, selected by
 * NAME as data — never by a host-supplied element or asset.
 * Logos are owned by the design system (Stephen's 2026-11-19
 * ruling, the #688 BigFooter ruling): brand identity reaches
 * DS components as data only (a label, an href, and — since
 * #726 — an optional brand-mark name), and the DS renders the
 * mark itself from artwork bundled here.
 *
 * Eciperay's mark (#861): Stephen picked round 3, concept 2
 * — "Ecipe-ray" — on 2026-11-25: a terracotta sun with rays
 * rising behind a sage recipe card bearing a cream E, the
 * pig-latin split made visual (ecipe + ray). It replaces the
 * blue spoon mark ported under #726. The port is traced from
 * the approved concept's own measurements, verified by
 * rendering the mark against the concept until the
 * silhouettes matched (silhouette IoU 0.97 at 512px):
 * the sun is a disc (centre (128.1, 114.8), radius 50.6 on
 * this 256 grid) whose lower half the card covers; eleven
 * rectangular rays (6.0 wide, radii 57.8–78.8 from the disc's
 * centre, so a clear paper gap rings the disc) fan at 15°
 * steps from vertical (±15°, ±30°, ±45°, ±60°, ±75°); the
 * recipe card is a rounded rect (40.1, 110.2, 175.9 × 109.8,
 * radius 11.2) with five cream binder holes down its left
 * edge and the block E centred on the card face. The whole
 * composition sits on the warm-paper field — the rounded
 * field the previous Eciperay mark carried — and the E and
 * the binder holes are cut in that same paper colour,
 * exactly as the concept paints them.
 *
 * The mark's colors are the brand's own Warm Harvest
 * palette — part of the artwork, never recolored from the
 * active theme: terracotta #c2410c (sun and rays), sage
 * #5f6f52 (the card), warm paper #faf6f0 (the field, the E,
 * and the binder holes).
 *
 * A brand with no mark (Memorize, today) names none: callers
 * render the wordmark alone, exactly as before — there is no
 * placeholder or empty slot for a missing mark.
 *
 * This is filled brand artwork, not a Feather glyph, so it
 * does NOT render through the stroke-based Icon base
 * component; it uses react-native-svg directly, the
 * AppStoreBadge precedent, so the mark is identical on web
 * and React Native. The mark is decorative wherever it
 * renders: the wrapping brand link's accessible name stays
 * the brand label.
 */

/** The brands that have a DS-owned graphic mark, named as data. */
export type BrandMarkName = "eciperay";

/** The Eciperay mark's Warm Harvest colors — brand artwork, never theme-derived. */
const ECIPERAY_MARK_PAPER = "#faf6f0";
const ECIPERAY_MARK_SUN = "#c2410c";
const ECIPERAY_MARK_CARD = "#5f6f52";

/**
 * The Ecipe-ray fan (#861): eleven rectangular rays on their
 * measured axes — 15° steps from vertical, each 6.0 wide,
 * running from radius 57.8 to 78.8 about the sun disc's
 * centre (128.1, 114.8), so every ray floats with clear
 * paper between it and the disc and its neighbours.
 */
const ECIPERAY_RAYS_PATH =
  "M71.5 102.8 L51.2 97.3 L52.8 91.5 L73.1 96.9 Z M76.5 88.5 L58.3 78.0 L61.4 72.8 L79.6 83.3 Z M85.1 76.1 L70.2 61.2 L74.5 56.9 L89.4 71.8 Z M96.6 66.3 L86.1 48.1 L91.3 45.0 L101.8 63.2 Z M110.2 59.8 L104.8 39.5 L110.6 37.9 L116.1 58.2 Z M125.1 57.0 L125.1 36.0 L131.1 36.0 L131.1 57.0 Z M140.1 58.2 L145.6 37.9 L151.4 39.5 L146.0 59.8 Z M154.4 63.2 L164.9 45.0 L170.1 48.1 L159.6 66.3 Z M166.8 71.8 L181.7 56.9 L186.0 61.2 L171.1 76.1 Z M176.6 83.3 L194.8 72.8 L197.9 78.0 L179.7 88.5 Z M183.1 96.9 L203.4 91.5 L205.0 97.3 L184.7 102.8 Z";

/**
 * The recipe card's cream E (#861), traced from the concept:
 * a block E (110.1–160.4 × 131.6–198.1) with a 14.7-wide
 * stem, 13.0-thick bars, and the middle bar stopping short
 * of the top and bottom bars, as the concept draws it.
 */
const ECIPERAY_CARD_E_PATH =
  "M110.1 131.6 L160.4 131.6 L160.4 144.6 L124.9 144.6 L124.9 158.2 L154.7 158.2 L154.7 171.1 L124.9 171.1 L124.9 185.1 L160.4 185.1 L160.4 198.1 L110.1 198.1 Z";

/** The card's five binder holes (#861): paper circles down
 * the card's left edge, evenly spaced, measured from the
 * concept (centre x 55.6, radius 5.4). */
const ECIPERAY_CARD_HOLE_CYS = [127.1, 146.0, 165.0, 184.0, 202.9];

export type BrandMarkProps = {
  /** The brand whose mark renders — data, never an element. */
  mark: BrandMarkName;
  /** Square size in px. Defaults to 24. */
  size?: number;
};

/**
 * The graphic mark for a named brand, rendered from the DS's
 * own artwork. Decorative (`aria-hidden`): the brand surfaces
 * that render it carry the brand label as their accessible
 * name.
 */
export function BrandMark({ mark, size = 24 }: BrandMarkProps) {
  switch (mark) {
    case "eciperay":
      return (
        <Svg width={size} height={size} viewBox="0 0 256 256" aria-hidden={true}>
          <Rect x={20} y={20} width={216} height={216} rx={48} fill={ECIPERAY_MARK_PAPER} />
          {/* The terracotta ray fan and sun disc, rising behind
              the recipe card — the card covers the disc's
              lower half. */}
          <Path d={ECIPERAY_RAYS_PATH} fill={ECIPERAY_MARK_SUN} />
          <Circle cx={128.1} cy={114.8} r={50.6} fill={ECIPERAY_MARK_SUN} />
          {/* The sage recipe card. */}
          <Rect x={40.1} y={110.2} width={175.9} height={109.8} rx={11.2} fill={ECIPERAY_MARK_CARD} />
          {/* The card's paper binder holes and its cream E. */}
          {ECIPERAY_CARD_HOLE_CYS.map((cy) => (
            <Circle key={cy} cx={55.6} cy={cy} r={5.4} fill={ECIPERAY_MARK_PAPER} />
          ))}
          <Path d={ECIPERAY_CARD_E_PATH} fill={ECIPERAY_MARK_PAPER} />
        </Svg>
      );
  }
}
