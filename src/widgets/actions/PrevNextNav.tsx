import { Row } from "../layout/Row.js";
import { useVoice } from "../../voice/index.js";

import { Button } from "./Button.js";

export type PrevNextNavProps = {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
};

/**
 * Back/next step navigation row for wizards, cooking mode, and multi-step
 * flows. Back renders as a ghost button, Next as primary. When `onBack` is
 * omitted, the Next button aligns to the right on its own. Pass
 * `backDisabled` to keep the Back button visible in its disabled state
 * (e.g. on the first step of a flow) without changing the row layout;
 * omit `onBack` entirely to hide the button.
 */
export function PrevNextNav({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  backDisabled = false,
  nextDisabled = false,
}: PrevNextNavProps) {
  const voice = useVoice();
  const resolvedBackLabel = backLabel ?? voice.prevNextNav.backLabel;
  const resolvedNextLabel = nextLabel ?? voice.prevNextNav.nextLabel;
  return (
    <Row middle gap="m" {...(onBack ? { between: true as const } : { right: true as const })}>
      {onBack ? (
        <Button ghost onPress={onBack} disabled={backDisabled}>
          {resolvedBackLabel}
        </Button>
      ) : null}
      {onNext ? (
        <Button variant="primary" onPress={onNext} disabled={nextDisabled}>
          {resolvedNextLabel}
        </Button>
      ) : null}
    </Row>
  );
}
