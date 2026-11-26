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
 * on the warm-paper field (#faf8f2). The artwork below is a
 * vector port of that composition, drawn on the same 256
 * grid: a fan of twelve long tapered rays behind an open
 * book in slight perspective (two covers sloping either side
 * of a central spine, the page-block edge above the cream
 * page surface), the flame rising on a slim stem at the
 * fan's center, and the notched bookmark below the right
 * cover. Stephen directed a re-trace on 2026-11-25 after the
 * first port diverged from the concept: this geometry is
 * traced from the concept itself (ray tips measured by an
 * angular scan of the fan, book and flame cross-sections
 * measured from the artwork) and verified by rendering the
 * mark against the concept until the silhouettes matched.
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
 * The Memorize ray fan (#861): twelve long tapered slivers
 * fanning from the book's center (128,142) across ~170° —
 * tips measured from the approved concept at ±9°, ±17.5°,
 * ±29.5°, ±42°, ±53.5°, and ±66° from vertical. Each ray is a
 * sliver: a fine point at the base, widest a third of the way
 * out, tapering to the tip.
 */
const MEMORIZE_RAYS_PATH =
  "M127.6 142.8 C102.7 134.5 75.5 120.6 48.8 105.6 C77.6 116.1 105.8 127.6 128.4 141.2 Z M127.5 142.7 C103.8 128.8 79.3 108.5 55.6 87.2 C82.5 104.3 108.8 122.3 128.5 141.3 Z M127.3 142.6 C105.9 123.9 85.3 98.2 65.7 71.6 C89.7 94.3 112.7 117.9 128.7 141.4 Z M127.2 142.4 C109.6 118.8 94.5 88.2 80.5 56.9 C99.8 85.2 117.9 114.2 128.8 141.6 Z M127.1 142.3 C114.6 115.0 105.8 81.4 98.5 47.3 C111.8 79.5 123.7 112.2 128.9 141.7 Z M127.1 142.1 C118.8 112.9 115.4 77.9 113.3 42.7 C121.5 77.0 128.3 111.5 128.9 141.9 Z M127.1 141.9 C127.9 111.5 135.0 77.1 143.5 42.9 C141.2 78.1 137.4 113.0 128.9 142.1 Z M127.1 141.7 C132.3 112.1 144.3 79.4 157.6 47.1 C150.2 81.2 141.5 115.0 128.9 142.3 Z M127.2 141.6 C138.4 114.3 156.7 85.4 176.2 57.3 C162.0 88.5 146.5 118.9 128.8 142.4 Z M127.3 141.4 C143.4 117.8 166.4 94.1 190.5 71.3 C170.8 98.0 150.1 123.8 128.7 142.6 Z M127.5 141.3 C147.4 122.4 173.8 104.6 200.9 87.8 C177.0 108.9 152.3 129.0 128.5 142.7 Z M127.6 141.2 C150.2 127.6 178.6 116.0 207.4 105.4 C180.6 120.5 153.4 134.5 128.4 142.8 Z";

/**
 * The Memorize flame (#861): the concept's flame traced —
 * a pointed tip curling at the top, a small lick on the left
 * side, a plump body, and a slim stem running from the body
 * all the way down to the book's center, the center ray of
 * the fan with the flame on top.
 */
const MEMORIZE_FLAME_PATH =
  "M129.6 28.6 C132.8 34.5 135.2 41 135.3 49 C135.4 56 134.2 62.5 131.9 68.5 C130.7 71.5 130.2 75 130.1 80 L130.1 143 L126.2 143 C126.2 105 126.3 88 126.4 76 C126.5 72 124.6 66.5 122.8 61 C120.0 56 119.2 51 120.4 46.5 C121.7 44 122.2 42.3 122.9 41 C124 43 125.1 44.3 126 44.9 C127.2 39.8 128.6 33.9 129.6 28.6 Z";

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
          {/* The golden ray fan and the central flame on its stem,
              rising from the book's center. */}
          <Path d={MEMORIZE_RAYS_PATH} fill={MEMORIZE_MARK_ACCENT} />
          <Path d={MEMORIZE_FLAME_PATH} fill={MEMORIZE_MARK_ACCENT} />
          {/* The notched bookmark, tucked under the right cover. */}
          <Path
            d="M154.5 199 L176.5 194.8 L176.8 224.2 L165.5 217.8 L156.8 227.7 Z"
            fill={MEMORIZE_MARK_ACCENT}
          />
          {/* The open book in slight perspective: the page-block
              edge above the cream page surface, two covers sloping
              either side of the central spine. */}
          <Path
            d="M60 127.5 C86 132 108 137.5 128 141 C148 137.5 170 132 196 127.5 C170 134.8 148 140.2 128 143.6 C108 140.2 86 134.8 60 130.2 Z"
            fill={MEMORIZE_MARK_BOOK}
          />
          <Path
            d="M59 130.2 C80 134.5 100 141 116.5 146.5 L116.5 209.5 C96 204.5 76 199.5 57.5 195.5 C54.3 194.8 52.9 192.3 52.8 188.5 L52.6 137.5 C52.6 133.2 54.8 130.9 59 130.2 Z"
            fill={MEMORIZE_MARK_BOOK}
          />
          <Path
            d="M197 130.2 C176 134.5 156 141 139.5 146.5 L139.5 209.5 C160 204.5 180 199.5 198.5 195.5 C201.7 194.8 203.1 192.3 203.2 188.5 L203.4 137.5 C203.4 133.2 201.2 130.9 197 130.2 Z"
            fill={MEMORIZE_MARK_BOOK}
          />
          <Path
            d="M119.2 146.2 C124 147.9 132 147.9 137 146.2 L137 207 C137 214.2 133 218.6 128 218.6 C123 218.6 119.2 214.2 119.2 207 Z"
            fill={MEMORIZE_MARK_BOOK}
          />
        </Svg>
      );
  }
}
