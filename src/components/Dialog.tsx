import type { ReactNode } from "react";
import { Dialog as TamaguiDialog, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledOverlay = styled(TamaguiDialog.Overlay, {
  name: "DialogOverlay",

  backgroundColor: tokens.colors.gray.gray10,
  opacity: 0.5,
});

const StyledContent = styled(TamaguiDialog.Content, {
  name: "DialogContent",

  backgroundColor: "$surface",
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing[5],
  width: "90%",
  maxWidth: 400,
});

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional footer row of buttons (the app composes these). */
  actions?: ReactNode;
};

/**
 * Modal dialog wrapping Tamagui's Dialog (focus trap, Escape-to-close, and
 * overlay dismissal come from the primitive). Controlled via
 * `open`/`onOpenChange`; the app renders its own trigger element and calls
 * `onOpenChange(true)`. The title uses proper heading semantics.
 */
export function Dialog({ open, onOpenChange, title, description, children, actions }: DialogProps) {
  return (
    <TamaguiDialog open={open} onOpenChange={onOpenChange}>
      <TamaguiDialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <YStack gap={tokens.spacing[3]}>
            <TamaguiDialog.Title
              fontSize={tokens.typography.fontSize.xl}
              fontWeight={tokens.typography.fontWeight.semibold}
              color="$color"
            >
              {title}
            </TamaguiDialog.Title>
            {description ? (
              <TamaguiDialog.Description>
                <Text variant="hint">{description}</Text>
              </TamaguiDialog.Description>
            ) : null}
            <YStack>{children}</YStack>
            {actions ? (
              <XStack gap={tokens.spacing[2]} justifyContent="flex-end">
                {actions}
              </XStack>
            ) : null}
          </YStack>
        </StyledContent>
      </TamaguiDialog.Portal>
    </TamaguiDialog>
  );
}
