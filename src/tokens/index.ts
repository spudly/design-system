import { colors } from "./colors.js";
import { radii } from "./radii.js";
import { shadows } from "./shadows.js";
import { spacing } from "./spacing.js";
import { typography } from "./typography.js";

export { colors } from "./colors.js";
export { radii } from "./radii.js";
export { shadows } from "./shadows.js";
export { spacing } from "./spacing.js";
export { typography } from "./typography.js";

/**
 * The single token object consumed by themes and components.
 * All values are plain and serializable.
 */
export const tokens = { colors, typography, spacing, radii, shadows } as const;

export type Tokens = typeof tokens;
