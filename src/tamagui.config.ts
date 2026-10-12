import { createTamagui } from "tamagui";
import { tokens } from "./tokens/index.js";

/**
 * Tamagui configuration wiring the design-system tokens in.
 *
 * Consumers wrap their app in `<TamaguiProvider config={tamaguiConfig}>`
 * (web) / the native equivalent. Components in this package reference the
 * raw `tokens` object directly so they stay usable even without the provider,
 * while the config below additionally exposes `$token` shorthands for
 * app-level styling.
 *
 * NOTE: media breakpoints and font configs are intentionally minimal here;
 * they grow with the first real design direction.
 */
export const tamaguiConfig = createTamagui({
  tokens: {
    color: {
      ...tokens.colors.gray,
      ...tokens.colors.primary,
      ...tokens.colors.success,
      ...tokens.colors.warning,
      ...tokens.colors.danger,
    },
    space: { ...tokens.spacing },
    size: { ...tokens.spacing },
    radius: { ...tokens.radii },
    zIndex: { base: 0, above: 10, modal: 100 },
  },
});

export default tamaguiConfig;

type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
