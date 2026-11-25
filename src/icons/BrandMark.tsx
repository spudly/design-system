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
 * Eciperay's mark: its geometry is ported verbatim from the
 * eciperay logo's own minimal variant
 * (packages/theme/logos/generated/logo-minimal.svg in the
 * eciperay repo — the rounded blue app-icon field with the
 * white spoon, without the blueprint grid the full logo
 * carries, which would muddy at header sizes). Stephen
 * approved the port (option A on #726, 2026-11-20): it
 * restores exactly the mark eciperay #620 lost when the host
 * adopted the DS AppShellPage.
 *
 * Memorize's mark (#861): Stephen picked concept 1 on
 * 2026-11-25 — an open book with golden rays fanning from its
 * pages, a central flame, and a bookmark hanging below the
 * right cover — and confirmed the composition stands ported
 * in Memorize's Quiet Dawn palette: the book in deep teal
 * (#0f766e), the rays, flame, and bookmark in gold (#b45309),
 * on the warm-paper field (#faf8f2). The artwork below is an
 * original vector port of that composition, drawn on the
 * same 256 grid: a fan of tapered rays behind a front-facing
 * open book (two covers either side of a central spine), the
 * flame rising on the center ray's stem, and the notched
 * bookmark below the right cover.
 *
 * Each mark's colors are the brand's own — part of the
 * artwork, never recolored from the active theme.
 *
 * A brand with no mark names none: callers render the
 * wordmark alone, exactly as before — there is no
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
export type BrandMarkName = "eciperay" | "memorize";

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

/** The Memorize mark's Quiet Dawn colors — brand artwork, never theme-derived. */
const MEMORIZE_MARK_FIELD = "#faf8f2";
const MEMORIZE_MARK_BOOK = "#0f766e";
const MEMORIZE_MARK_ACCENT = "#b45309";

/**
 * The Memorize flame (#861): a single flame on a slim stem,
 * rising from the book's center along the middle of the ray
 * fan — the concept's central flame.
 */
const MEMORIZE_FLAME_PATH =
  "M128 34c6 14 14 22 14 36 0 12-6 20-11 24l-1 56h-4l-1-56c-5-4-11-12-11-24 0-14 8-22 14-36z";

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
    case "memorize":
      return (
        <Svg width={size} height={size} viewBox="0 0 256 256" aria-hidden={true}>
          <Rect x={20} y={20} width={216} height={216} rx={48} fill={MEMORIZE_MARK_FIELD} />
          {/* The golden ray fan, tapered rays rising from the book's center. */}
          <Path d="M128.3 158.8 L66.3 155.5 L127.7 165.2 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M129.0 159.0 L44.3 134.8 L127.0 165.0 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M129.7 159.3 L53.4 115.4 L126.3 164.7 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M130.3 159.8 L66.9 98.7 L125.7 164.2 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M130.8 160.4 L84.0 85.8 L125.2 163.6 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M131.1 161.1 L103.7 77.4 L124.9 162.9 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M131.1 162.9 L152.3 77.4 L124.9 161.1 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M130.8 163.6 L172.0 85.8 L125.2 160.4 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M130.3 164.2 L189.1 98.7 L125.7 159.8 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M129.7 164.7 L202.6 115.4 L126.3 159.3 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M129.0 165.0 L211.7 134.8 L127.0 159.0 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d="M128.3 165.2 L189.7 155.5 L127.7 158.8 Z" fill={MEMORIZE_MARK_ACCENT} />
          <Path d={MEMORIZE_FLAME_PATH} fill={MEMORIZE_MARK_ACCENT} />
          {/* The open book: page edges offset above the covers, two
              covers either side of the central spine. */}
          <Path
            d="M48 144 L116 158 L116 166 L48 154 Z M140 158 L208 144 L208 154 L140 166 Z"
            fill={MEMORIZE_MARK_BOOK}
          />
          <Path d="M52 154 L116 166 L116 218 L52 206 Z" fill={MEMORIZE_MARK_BOOK} />
          <Path d="M140 166 L204 154 L204 206 L140 218 Z" fill={MEMORIZE_MARK_BOOK} />
          <Path d="M116 166 L140 166 L140 220 Q128 226 116 220 Z" fill={MEMORIZE_MARK_BOOK} />
          {/* The notched bookmark hanging below the right cover. */}
          <Path d="M172 208 L194 208 L194 232 L183 224 L172 232 Z" fill={MEMORIZE_MARK_ACCENT} />
        </Svg>
      );
  }
}
