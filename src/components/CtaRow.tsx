import type { ReactNode } from "react";
import { YStack } from "tamagui";

export type CtaRowProps = {
  /** The row's calls to action (Button href links), in display order. */
  children: ReactNode;
};

/**
 * The call-to-action row (#171, extracted for #119): the CTAs
 * under a hero — stacked narrow, a row on wide. The DS Tamagui
 * config defines no width breakpoints — the contract's narrow
 * rendering is the native one (the RN storybook / Android VR
 * capture) and its wide rendering is web — so the row is a flat
 * `web:` clause on a column stack, the ScreenContainer idiom. A
 * wrapping row could seat two CTAs side by side at the 430px
 * story viewport, which is not the contracted stack, so the row
 * deliberately does not wrap. Tamagui applies the clause when IT
 * compiles the style; ui's web build is Vite, which does not run
 * the compiler, so the clause only takes effect behind a
 * consumer that compiles (Tamagui's Vite plugin / Metro) — the
 * contract records the intended responsive geometry whatever the
 * consumer.
 */
export function CtaRow({ children }: CtaRowProps) {
  return (
    <YStack flexDirection="web:row" gap="$3" alignItems="center" justifyContent="center">
      {children}
    </YStack>
  );
}
