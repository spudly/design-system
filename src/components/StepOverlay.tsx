import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type StepOverlayProps = {
  /** The top eyebrow line: the context the steps belong to (a
   * meal's title). */
  title: string;
  /** The second eyebrow line: the current step, pre-composed
   * ("Step 2 of 5") — the overlay renders it verbatim. */
  stepLabel: string;
  /** The step's body text, rendered at reading size. */
  body: string;
  /** The Done pill's label ("Done"). */
  doneLabel?: string;
  /** The Done pill's callback: leaving the steps. */
  onDone: () => void;
  /** The step navigation under the body — progress dots, a
   * prev/next row — composed by the caller; the overlay owns
   * the shell and the header treatment, not the controls. */
  children?: ReactNode;
};

/**
 * A full-screen step-reader overlay (#119): a dark, opaque
 * shell that fills its nearest positioned ancestor (so the
 * page beneath does not show through), a translucent Done pill
 * pinned to the top right, and the step's text in a centered
 * column — two eyebrow lines (the context, then the step) over
 * the body at reading size. The caller's step navigation
 * (progress dots, prev/next) composes below the body as
 * children.
 *
 * The pill is a pressable view with the button semantics
 * routed through the platform translator (#237), and web
 * keyboard activation: it is focusable and Enter / Space invoke
 * the same callback as a press (web-only props, ignored on
 * native).
 *
 * First consumer: MealCookingModePage's cooking steps. Any
 * step-by-step reader — a guided flow, a workout — composes
 * the same shell with its own navigation.
 */
export function StepOverlay({
  title,
  stepLabel,
  body,
  doneLabel = "Done",
  onDone,
  children,
}: StepOverlayProps) {
  // Web keyboard support (the MealPlansPage row pattern): a
  // view carrying a role is made focusable and the activation
  // keys — Enter and Space — invoke the same callback as a
  // press. A held key's repeats still prevent the default but
  // do not re-fire Done. Web-only props, ignored on native.
  const handleDoneKeyDown = (event: {
    key: string;
    repeat?: boolean;
    preventDefault: () => void;
  }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) {
        onDone();
      }
    }
  };
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      justifyContent="center"
      backgroundColor={tokens.colors.gray.gray10}
      paddingHorizontal="$6"
    >
      <YStack
        position="absolute"
        right={tokens.spacing[6]}
        top={tokens.spacing[12]}
        borderRadius={tokens.radii.full}
        overflow="hidden"
        {...platformAccessibilityProps({
          accessibilityRole: "button",
          accessibilityLabel: doneLabel,
        })}
        onPress={onDone}
        tabIndex={0}
        onKeyDown={handleDoneKeyDown}
        cursor="web:pointer"
      >
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="$surface"
          opacity={0.1}
        />
        <Text
          fontSize={tokens.typography.fontSize.sm}
          color="$surface"
          paddingHorizontal="$4"
          paddingVertical="$2"
        >
          {doneLabel}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          letterSpacing={1.4}
          color="$surface"
          opacity={0.6}
          textTransform="uppercase"
        >
          {title}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$4">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          letterSpacing={1.4}
          color="$surface"
          opacity={0.6}
          textTransform="uppercase"
        >
          {stepLabel}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$8">
        <Text fontSize={tokens.typography.fontSize["2xl"]} color="$surface">
          {body}
        </Text>
      </YStack>
      {children}
    </YStack>
  );
}
