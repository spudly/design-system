import { isWeb } from "tamagui";

/**
 * Platform-split accessibility props for live regions and grouping.
 *
 * `status` and `group` are web ARIA roles. They are NOT members of React
 * Native's `accessibilityRole` set, and passing them as `accessibilityRole`
 * makes Android's view manager throw on mount:
 * `JSApplicationIllegalArgumentException: Invalid accessibility role value:
 * "status"` (spudly/eciperay#156 — InlineAlert, Toast, DismissibleBanner,
 * and SecretRevealPanel all crashed this way; Avatar's `img` and the
 * `group` roles in NumberStepper/ColorPickerField were the same defect).
 *
 * So ARIA-only roles go through the separate web `role` prop, web only,
 * and native gets the equivalent native mechanism instead:
 *
 * - A polite live region is `role="status"` on web and
 *   `accessibilityLiveRegion="polite"` (Android) on native. iOS has no
 *   live-region prop; VoiceOver picks up the content change from the
 *   accessibility tree.
 * - A grouping container is `role="group"` on web; native has no group
 *   role, so the container's accessible name (accessibilityLabel /
 *   aria-labelledby) carries the grouping on its own there.
 */
export const politeLiveRegionProps = isWeb
  ? ({ role: "status" } as const)
  : ({ accessibilityLiveRegion: "polite" } as const);

export const groupRoleProps = isWeb ? ({ role: "group" } as const) : ({} as const);
