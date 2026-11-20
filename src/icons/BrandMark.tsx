import { Path, Rect, Svg } from "react-native-svg";

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
 * The one mark today is Eciperay's: its geometry is ported
 * verbatim from the eciperay logo's own minimal variant
 * (packages/theme/logos/generated/logo-minimal.svg in the
 * eciperay repo — the rounded blue app-icon field with the
 * white spoon, without the blueprint grid the full logo
 * carries, which would muddy at header sizes). Stephen
 * approved the port (option A on #726, 2026-11-20): it
 * restores exactly the mark eciperay #620 lost when the host
 * adopted the DS AppShellPage. The mark's colors are the
 * brand's own — part of the artwork, never recolored from the
 * active theme.
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

/**
 * The Eciperay spoon glyph, ported from the eciperay logo's
 * minimal variant (see the file header): the white spoon
 * centered on the brand's blue app-icon field.
 */
const ECIPERAY_SPOON_PATH =
  "M126.228 207.647c-2.746-.355-5.646-1.646-7.695-3.434-1.534-1.338-2.372-2.427-3.287-4.18-2.191-4.273-2.346-8.938-.683-22.069.258-1.989.94-6.962 1.534-11.058 2.294-15.901 2.397-16.825 2.397-23.123.013-4.677-.013-5.115-.322-6.323-1.031-3.99-3.016-6.547-6.935-8.986-3.634-2.25-5.71-3.872-7.733-6.027-8.507-9.022-11.266-24.769-7.283-41.345 1.586-6.607 3.957-12.598 6.78-17.12 5.259-8.407 12.013-13.498 20.378-15.357 2.011-.45 6.948-.497 8.881-.083 5.285 1.125 9.435 3.233 13.573 6.891 6.883 6.098 12.038 16.079 14.371 27.8.941 4.736 1.315 8.324 1.315 12.622 0 7.577-1.65 14.67-4.77 20.412-1.688 3.137-3.209 5.067-5.954 7.6-2.036 1.883-2.604 2.31-6.702 4.974-3.506 2.273-5.517 5.008-6.38 8.643-.4 1.657-.542 6.713-.297 10.253.283 4.014.477 5.435 3.325 24.852 2.166 14.764 2.424 20.412 1.16 24.852-.438 1.527-1.637 3.872-2.603 5.091-1.495 1.847-3.906 3.576-5.878 4.227-.541.19-1.095.414-1.224.52-.452.344-4.28.593-5.942.38z";

/** The Eciperay mark's own colors — brand artwork, never theme-derived. */
const ECIPERAY_MARK_FIELD = "#0943ce";
const ECIPERAY_MARK_GLYPH = "#eef2f6";

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
          <Rect x={20} y={20} width={216} height={216} rx={48} fill={ECIPERAY_MARK_FIELD} />
          <Path d={ECIPERAY_SPOON_PATH} fill={ECIPERAY_MARK_GLYPH} />
        </Svg>
      );
  }
}
