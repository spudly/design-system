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
 * A second pass the same day widened the fan to the
 * concept's full spread, slimmed the rays to their measured
 * width profile, and re-traced the flame at full size.
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
 * fanning from the book's center (128,142) — tips measured
 * from the approved concept at ±9°, ±17.5°, ±29.5°, ±42°,
 * ±53.5°, and ±66° from vertical, at radii of 86–98 units,
 * so the outer rays run long and low, their tips reaching
 * just past the book's outer corners. Each ray's width
 * follows the concept's measured profile: a fine point at
 * the base, ~3 units wide a quarter of the way out, widest
 * (~5 units) around 60% out, then tapering to the tip —
 * slim enough at the base that the fan reads as separate
 * rays rising from the pages, never a solid sunburst.
 */
const MEMORIZE_RAYS_PATH =
  "M127.3 142.1 C126.6 139.7 125.4 132.0 124.5 127.7 C123.7 123.3 123.0 119.8 122.2 116.1 C121.5 112.4 120.8 109.1 120.1 105.6 C119.3 102.0 118.6 98.5 118.0 95.0 C117.3 91.4 116.8 87.9 116.3 84.3 C115.7 80.8 115.2 77.2 114.7 73.7 C114.2 70.1 113.7 66.4 113.3 63.0 C112.9 59.6 112.5 56.2 112.4 53.2 C112.3 50.2 112.6 46.5 112.7 45.2 C112.7 43.9 112.2 44.0 112.7 45.2 C113.1 46.5 114.6 49.9 115.4 52.7 C116.2 55.6 116.9 58.9 117.6 62.3 C118.2 65.7 118.9 69.4 119.5 72.9 C120.2 76.4 120.7 80.0 121.3 83.5 C121.9 87.1 122.5 90.6 123.0 94.2 C123.5 97.7 123.9 101.3 124.3 104.9 C124.7 108.5 125.1 111.9 125.5 115.6 C125.9 119.3 126.4 122.9 126.9 127.3 C127.4 131.7 128.6 139.4 128.7 141.9 C128.8 144.4 128.0 144.5 127.3 142.1 Z M127.3 141.9 C127.4 139.4 128.6 131.7 129.1 127.3 C129.6 122.9 130.1 119.3 130.5 115.6 C130.9 111.9 131.3 108.5 131.7 104.9 C132.1 101.3 132.5 97.7 133.0 94.2 C133.5 90.6 134.1 87.1 134.7 83.5 C135.3 80.0 135.8 76.4 136.5 72.9 C137.1 69.4 137.8 65.7 138.4 62.3 C139.1 58.9 139.8 55.6 140.6 52.7 C141.4 49.9 142.9 46.5 143.3 45.2 C143.8 44.0 143.3 43.9 143.3 45.2 C143.4 46.5 143.7 50.2 143.6 53.2 C143.5 56.2 143.1 59.6 142.7 63.0 C142.3 66.4 141.8 70.1 141.3 73.7 C140.8 77.2 140.3 80.8 139.7 84.3 C139.2 87.9 138.7 91.4 138.0 95.0 C137.4 98.5 136.7 102.0 135.9 105.6 C135.2 109.1 134.5 112.4 133.8 116.1 C133.0 119.8 132.3 123.3 131.5 127.7 C130.6 132.0 129.4 139.7 128.7 142.1 C128.0 144.5 127.2 144.4 127.3 141.9 Z M127.3 142.2 C126.3 140.0 123.9 132.6 122.5 128.5 C121.0 124.4 119.8 121.0 118.6 117.5 C117.3 114.0 116.1 110.8 114.9 107.5 C113.7 104.1 112.4 100.8 111.3 97.4 C110.1 94.1 109.1 90.7 108.1 87.3 C107.0 83.9 106.0 80.5 105.0 77.1 C103.9 73.6 102.9 70.1 102.0 66.8 C101.2 63.5 100.2 60.2 99.7 57.4 C99.2 54.5 99.0 50.8 98.8 49.5 C98.7 48.2 98.2 48.3 98.8 49.5 C99.5 50.6 101.4 53.8 102.6 56.4 C103.9 59.1 105.0 62.3 106.1 65.5 C107.3 68.7 108.5 72.2 109.6 75.6 C110.8 79.0 111.8 82.3 112.9 85.7 C114.0 89.1 115.1 92.5 116.1 95.9 C117.1 99.3 118.0 102.8 119.0 106.2 C119.9 109.6 120.7 112.9 121.7 116.5 C122.7 120.1 123.6 123.6 124.8 127.8 C125.9 132.0 128.2 139.4 128.7 141.8 C129.1 144.2 128.4 144.4 127.3 142.2 Z M127.3 141.8 C127.8 139.4 130.1 132.0 131.2 127.8 C132.4 123.6 133.3 120.1 134.3 116.5 C135.3 112.9 136.1 109.6 137.0 106.2 C138.0 102.8 138.9 99.3 139.9 95.9 C140.9 92.5 142.0 89.1 143.1 85.7 C144.2 82.3 145.2 79.0 146.4 75.6 C147.5 72.2 148.7 68.7 149.9 65.5 C151.0 62.3 152.1 59.1 153.4 56.4 C154.6 53.8 156.5 50.6 157.2 49.5 C157.8 48.3 157.3 48.2 157.2 49.5 C157.0 50.8 156.8 54.5 156.3 57.4 C155.8 60.2 154.8 63.5 154.0 66.8 C153.1 70.1 152.1 73.6 151.0 77.1 C150.0 80.5 149.0 83.9 147.9 87.3 C146.9 90.7 145.9 94.1 144.7 97.4 C143.6 100.8 142.3 104.1 141.1 107.5 C139.9 110.8 138.7 114.0 137.4 117.5 C136.2 121.0 135.0 124.4 133.5 128.5 C132.1 132.6 129.7 140.0 128.7 142.2 C127.6 144.4 126.9 144.2 127.3 141.8 Z M127.4 142.3 C125.9 140.4 122.1 133.7 119.9 130.1 C117.6 126.4 115.8 123.4 113.8 120.3 C111.9 117.1 110.0 114.3 108.2 111.3 C106.3 108.3 104.4 105.3 102.6 102.3 C100.8 99.3 99.1 96.2 97.4 93.1 C95.7 90.1 94.0 87.0 92.3 83.9 C90.6 80.8 88.9 77.5 87.4 74.5 C85.8 71.5 84.3 68.6 83.2 65.9 C82.1 63.2 81.1 59.7 80.7 58.4 C80.3 57.2 79.9 57.5 80.7 58.4 C81.6 59.4 84.1 62.0 85.9 64.4 C87.6 66.7 89.3 69.6 91.1 72.4 C92.9 75.3 94.8 78.4 96.6 81.5 C98.4 84.5 100.1 87.6 101.9 90.6 C103.6 93.7 105.4 96.7 107.1 99.8 C108.7 102.9 110.3 106.1 111.9 109.2 C113.5 112.3 115.0 115.3 116.7 118.6 C118.3 121.9 120.0 125.0 122.0 128.9 C123.9 132.7 127.7 139.4 128.6 141.7 C129.5 143.9 128.8 144.3 127.4 142.3 Z M127.4 141.7 C128.3 139.4 132.1 132.7 134.0 128.9 C136.0 125.0 137.7 121.9 139.3 118.6 C141.0 115.3 142.5 112.3 144.1 109.2 C145.7 106.1 147.3 102.9 148.9 99.8 C150.6 96.7 152.4 93.7 154.1 90.6 C155.9 87.6 157.6 84.5 159.4 81.5 C161.2 78.4 163.1 75.3 164.9 72.4 C166.7 69.6 168.4 66.7 170.1 64.4 C171.9 62.0 174.4 59.4 175.3 58.4 C176.1 57.5 175.7 57.2 175.3 58.4 C174.9 59.7 173.9 63.2 172.8 65.9 C171.7 68.6 170.2 71.5 168.6 74.5 C167.1 77.5 165.4 80.8 163.7 83.9 C162.0 87.0 160.3 90.1 158.6 93.1 C156.9 96.2 155.2 99.3 153.4 102.3 C151.6 105.3 149.7 108.3 147.8 111.3 C146.0 114.3 144.1 117.1 142.2 120.3 C140.2 123.4 138.4 126.4 136.1 130.1 C133.9 133.7 130.1 140.4 128.6 142.3 C127.2 144.3 126.5 143.9 127.4 141.7 Z M127.5 142.5 C125.7 141.0 120.8 135.5 117.9 132.5 C115.0 129.6 112.6 127.2 110.2 124.6 C107.7 122.1 105.4 119.9 103.0 117.5 C100.6 115.1 98.2 112.7 95.9 110.2 C93.6 107.7 91.4 105.2 89.2 102.7 C86.9 100.2 84.7 97.6 82.5 95.1 C80.3 92.5 78.0 89.9 75.9 87.4 C73.9 84.9 71.8 82.4 70.2 80.1 C68.6 77.8 67.1 74.7 66.4 73.6 C65.8 72.5 65.4 72.9 66.4 73.6 C67.5 74.4 70.4 76.3 72.5 78.1 C74.6 79.9 76.9 82.2 79.1 84.5 C81.4 86.8 83.8 89.4 86.1 91.8 C88.4 94.3 90.7 96.8 93.0 99.3 C95.2 101.8 97.5 104.2 99.7 106.8 C101.9 109.3 104.1 112.0 106.2 114.6 C108.4 117.2 110.4 119.7 112.6 122.4 C114.8 125.2 117.0 127.8 119.7 130.9 C122.3 134.1 127.2 139.6 128.5 141.5 C129.8 143.5 129.3 144.0 127.5 142.5 Z M127.5 141.5 C128.8 139.6 133.7 134.1 136.3 130.9 C139.0 127.8 141.2 125.2 143.4 122.4 C145.6 119.7 147.6 117.2 149.8 114.6 C151.9 112.0 154.1 109.3 156.3 106.8 C158.5 104.2 160.8 101.8 163.0 99.3 C165.3 96.8 167.6 94.3 169.9 91.8 C172.2 89.4 174.6 86.8 176.9 84.5 C179.1 82.2 181.4 79.9 183.5 78.1 C185.6 76.3 188.5 74.4 189.6 73.6 C190.6 72.9 190.2 72.5 189.6 73.6 C188.9 74.7 187.4 77.8 185.8 80.1 C184.2 82.4 182.1 84.9 180.1 87.4 C178.0 89.9 175.7 92.5 173.5 95.1 C171.3 97.6 169.1 100.2 166.8 102.7 C164.6 105.2 162.4 107.7 160.1 110.2 C157.8 112.7 155.4 115.1 153.0 117.5 C150.6 119.9 148.3 122.1 145.8 124.6 C143.4 127.2 141.0 129.6 138.1 132.5 C135.2 135.5 130.3 141.0 128.5 142.5 C126.7 144.0 126.2 143.5 127.5 141.5 Z M127.6 142.5 C125.6 141.4 119.8 137.2 116.5 134.9 C113.1 132.6 110.4 130.7 107.5 128.8 C104.7 126.9 102.0 125.1 99.3 123.3 C96.6 121.5 93.8 119.6 91.1 117.7 C88.4 115.8 85.8 113.8 83.2 111.8 C80.5 109.9 77.9 107.9 75.2 105.9 C72.6 103.8 69.9 101.7 67.5 99.7 C65.0 97.8 62.5 95.8 60.6 93.9 C58.6 92.1 56.5 89.4 55.7 88.5 C54.8 87.6 54.5 87.9 55.7 88.5 C56.8 89.0 59.9 90.2 62.3 91.6 C64.7 92.9 67.3 94.7 69.9 96.5 C72.5 98.2 75.3 100.2 78.0 102.1 C80.7 104.0 83.4 106.0 86.0 107.9 C88.7 109.9 91.4 111.8 94.0 113.8 C96.6 115.8 99.2 117.9 101.7 120.0 C104.3 122.1 106.7 124.1 109.4 126.3 C112.1 128.5 114.7 130.5 117.8 133.1 C121.0 135.6 126.8 139.9 128.4 141.5 C130.0 143.0 129.6 143.6 127.6 142.5 Z M127.6 141.5 C129.2 139.9 135.0 135.6 138.2 133.1 C141.3 130.5 143.9 128.5 146.6 126.3 C149.3 124.1 151.7 122.1 154.3 120.0 C156.8 117.9 159.4 115.8 162.0 113.8 C164.6 111.8 167.3 109.9 170.0 107.9 C172.6 106.0 175.3 104.0 178.0 102.1 C180.7 100.2 183.5 98.2 186.1 96.5 C188.7 94.7 191.3 92.9 193.7 91.6 C196.1 90.2 199.2 89.0 200.3 88.5 C201.5 87.9 201.2 87.6 200.3 88.5 C199.5 89.4 197.4 92.1 195.4 93.9 C193.5 95.8 191.0 97.8 188.5 99.7 C186.1 101.7 183.4 103.8 180.8 105.9 C178.1 107.9 175.5 109.9 172.8 111.8 C170.2 113.8 167.6 115.8 164.9 117.7 C162.2 119.6 159.4 121.5 156.7 123.3 C154.0 125.1 151.3 126.9 148.5 128.8 C145.6 130.7 142.9 132.6 139.5 134.9 C136.2 137.2 130.4 141.4 128.4 142.5 C126.4 143.6 126.0 143.0 127.6 141.5 Z M127.8 142.5 C125.7 141.9 119.4 139.1 115.8 137.7 C112.2 136.2 109.3 135.1 106.2 133.8 C103.2 132.6 100.3 131.5 97.4 130.4 C94.5 129.2 91.5 128.1 88.6 126.8 C85.7 125.6 82.9 124.3 80.0 123.0 C77.1 121.7 74.2 120.4 71.4 119.1 C68.5 117.7 65.5 116.3 62.8 115.0 C60.1 113.6 57.4 112.4 55.2 111.0 C53.0 109.7 50.4 107.7 49.4 107.0 C48.5 106.4 48.3 106.8 49.4 107.0 C50.6 107.3 53.8 107.8 56.3 108.6 C58.7 109.4 61.5 110.5 64.3 111.6 C67.1 112.8 70.2 114.0 73.1 115.3 C76.0 116.5 78.9 117.8 81.7 119.0 C84.6 120.3 87.5 121.5 90.4 122.9 C93.2 124.2 96.1 125.6 98.9 127.0 C101.7 128.4 104.4 129.8 107.4 131.3 C110.3 132.7 113.1 134.1 116.6 135.8 C120.1 137.5 126.4 140.3 128.2 141.5 C130.1 142.6 129.8 143.2 127.8 142.5 Z M127.8 141.5 C129.6 140.3 135.9 137.5 139.4 135.8 C142.9 134.1 145.7 132.7 148.6 131.3 C151.6 129.8 154.3 128.4 157.1 127.0 C159.9 125.6 162.8 124.2 165.6 122.9 C168.5 121.5 171.4 120.3 174.3 119.0 C177.1 117.8 180.0 116.5 182.9 115.3 C185.8 114.0 188.9 112.8 191.7 111.6 C194.5 110.5 197.3 109.4 199.7 108.6 C202.2 107.8 205.4 107.3 206.6 107.0 C207.7 106.8 207.5 106.4 206.6 107.0 C205.6 107.7 203.0 109.7 200.8 111.0 C198.6 112.4 195.9 113.6 193.2 115.0 C190.5 116.3 187.5 117.7 184.6 119.1 C181.8 120.4 178.9 121.7 176.0 123.0 C173.1 124.3 170.3 125.6 167.4 126.8 C164.5 128.1 161.5 129.2 158.6 130.4 C155.7 131.5 152.8 132.6 149.8 133.8 C146.7 135.1 143.8 136.2 140.2 137.7 C136.6 139.1 130.3 141.9 128.2 142.5 C126.2 143.2 125.9 142.6 127.8 141.5 Z";

/**
 * The Memorize flame (#861): the concept's flame traced
 * from its measured row-by-row outline — a pointed tip
 * curling at the top, a small lick on the left side, a plump
 * body ~15 units wide, and a slim stem running from the body
 * all the way down to the book's center, the center ray of
 * the fan with the flame on top.
 */
const MEMORIZE_FLAME_PATH =
  "M128.2 28.8 C127.9 28.8 127.8 30.6 127.7 31.7 C127.6 32.8 127.7 34.2 127.8 35.5 C127.9 36.8 128.2 38.4 128.2 39.4 C128.2 40.4 127.9 40.7 127.8 41.3 C127.7 41.9 127.6 42.6 127.4 43.2 C127.2 43.8 126.9 44.5 126.6 45.1 C126.3 45.7 126.3 46.4 125.4 47.0 C124.5 47.6 121.8 48.4 121.0 49.0 C120.2 49.6 120.6 50.3 120.5 50.9 C120.4 51.5 120.3 52.2 120.3 52.8 C120.3 53.4 120.3 54.1 120.3 54.7 C120.3 55.3 120.4 56.0 120.5 56.6 C120.6 57.2 120.9 58.0 121.1 58.6 C121.3 59.2 121.6 59.9 121.9 60.5 C122.2 61.1 122.8 61.8 123.2 62.4 C123.6 63.0 124.1 63.7 124.5 64.3 C124.9 64.9 125.1 65.5 125.4 66.2 C125.7 66.9 125.9 67.6 126.1 68.2 C126.2 68.8 126.2 69.5 126.3 70.1 C126.4 70.7 126.5 71.0 126.5 72.0 C126.5 73.0 126.4 74.5 126.3 75.8 C126.2 77.1 126.1 78.1 126.1 79.7 C126.1 81.3 126.1 82.9 126.1 85.4 C126.1 88.0 126.1 90.9 126.1 95.0 C126.1 99.1 126.1 105.0 126.1 110.0 C126.1 115.0 126.1 119.5 126.1 125.0 C126.1 130.5 125.4 140.0 126.1 143.0 C126.8 146.0 129.4 146.0 130.1 143.0 C130.8 140.0 130.1 130.5 130.1 125.0 C130.1 119.5 130.1 115.0 130.1 110.0 C130.1 105.0 130.1 98.8 130.1 95.0 C130.1 91.2 130.2 90.0 130.2 87.4 C130.2 84.9 130.1 81.6 130.1 79.7 C130.1 77.8 130.0 77.1 129.9 75.8 C129.8 74.5 129.6 73.0 129.5 72.0 C129.4 71.0 129.5 70.7 129.5 70.1 C129.5 69.5 129.6 68.8 129.7 68.2 C129.8 67.6 129.8 66.9 129.9 66.2 C130.0 65.5 130.2 64.9 130.4 64.3 C130.6 63.7 130.7 63.0 130.9 62.4 C131.1 61.8 131.4 61.1 131.7 60.5 C132.0 59.9 132.2 59.2 132.5 58.6 C132.8 58.0 133.1 57.2 133.4 56.6 C133.7 56.0 133.9 55.3 134.2 54.7 C134.5 54.1 134.8 53.4 135.0 52.8 C135.2 52.2 135.4 51.5 135.5 50.9 C135.6 50.3 135.8 49.5 135.8 49.0 C135.9 48.5 135.8 48.3 135.8 48.0 C135.8 47.7 135.8 47.3 135.8 47.0 C135.8 46.7 135.8 46.3 135.8 46.0 C135.8 45.7 136.0 45.9 135.8 45.1 C135.7 44.3 135.2 42.2 134.9 41.3 C134.6 40.3 134.4 40.0 134.1 39.4 C133.8 38.8 133.4 38.0 133.1 37.4 C132.8 36.8 132.4 36.1 132.0 35.5 C131.6 34.9 131.1 34.2 130.7 33.6 C130.3 33.0 130.0 32.5 129.6 31.7 C129.2 30.9 128.5 28.8 128.2 28.8 Z";

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
