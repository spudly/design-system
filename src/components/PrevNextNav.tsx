import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";

export interface PrevNextNavProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
}

/**
 * Back/next step navigation row for wizards, cooking mode, and multi-step
 * flows. Back renders as a ghost button, Next as primary. When `onBack` is
 * omitted, the Next button aligns to the right on its own.
 */
export function PrevNextNav({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  nextDisabled = false,
}: PrevNextNavProps) {
  return (
    <XStack
      justifyContent={onBack ? "space-between" : "flex-end"}
      alignItems="center"
      gap={tokens.spacing[3]}
    >
      {onBack ? (
        <Button variant="ghost" onPress={onBack}>
          {backLabel}
        </Button>
      ) : null}
      {onNext ? (
        <Button variant="primary" onPress={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      ) : null}
    </XStack>
  );
}
