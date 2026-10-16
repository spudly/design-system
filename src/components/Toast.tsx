import type { ReactNode } from "react";
import { Toast as TamaguiToast, YStack, styled, toast } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const ToastCard = styled(YStack, {
  name: "SpudlyToast",

  // Theme-matched card (same treatment as Card): surface fill with a
  // 1px border. The previous fixed near-black (gray10) fill clashed with
  // both brand themes and, being the same color as the dark page
  // background, made the card's edges vanish in dark mode; the border
  // ($borderColor is #525252 in dark themes, ~2.3:1 against the #171717
  // page) plus the shadow keeps the edge defined in both modes.
  backgroundColor: "$surface",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.md,
  padding: tokens.spacing[3],
  gap: tokens.spacing[1],
  minWidth: 200,
  maxWidth: 360,
  shadowColor: tokens.shadows.md.shadowColor,
  shadowOffset: tokens.shadows.md.shadowOffset,
  shadowOpacity: tokens.shadows.md.shadowOpacity,
  shadowRadius: tokens.shadows.md.shadowRadius,
});

type ToastCardProps = GetProps<typeof ToastCard>;

export interface ToastProps extends ToastCardProps {
  title?: string;
  description?: ReactNode;
}

/**
 * Toast notification card in design-system tokens. This same card is what
 * `ToastProvider` renders for toasts fired via the `toast()` function
 * (re-exported below from Tamagui). The card itself announces via
 * `role="status"`.
 */
export function Toast({ title, description, ...rest }: ToastProps) {
  return (
    <ToastCard accessibilityRole="status" {...rest}>
      {title ? (
        <Text
          style={{
            color: "$color",
            fontWeight: tokens.typography.fontWeight.semibold,
          }}
        >
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text
          style={{
            color: "$textMuted",
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          {description}
        </Text>
      ) : null}
    </ToastCard>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Sets up Tamagui's toast system: viewport plus the toast host, rendering
 * each toast with the design-system `Toast` card (bottom position, 4s
 * duration by default). Wrap the app root once, then fire toasts with the
 * re-exported `toast()` function:
 *
 *   toast("Verse memorized!", { description: "Psalm 23:1" });
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      {/* Viewport and List must live INSIDE the Toast root: both consume
          the toast context and throw "`Toast.Viewport` must be used within
          `Toast`" when rendered as siblings of the root (the List belongs
          inside the Viewport). */}
      <TamaguiToast position="bottom-center" duration={4000}>
        <TamaguiToast.Viewport>
          <TamaguiToast.List
            renderItem={({ toast: t }) => (
              <Toast
                key={t.id}
                {...(typeof t.title === "string" ? { title: t.title } : {})}
                {...(typeof t.description === "string" ? { description: t.description } : {})}
              />
            )}
          />
        </TamaguiToast.Viewport>
      </TamaguiToast>
    </>
  );
}

export { toast };
