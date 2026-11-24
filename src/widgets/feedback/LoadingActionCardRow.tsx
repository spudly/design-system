import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { Button } from "../actions/Button.js";
import { Card } from "../Card.js";
import { TextSkeleton } from "./TextSkeleton.js";

export type LoadingActionCardRowProps = {
  /** The inert action's accessible name (e.g. "Delete meal"). */
  accessibilityLabel: string;
  /** The inert action's visible label (e.g. "Delete"). */
  children: ReactNode;
};

/**
 * A loading row in the TextActionCardRow shape (#119, #278):
 * an elevated card, row direction, holding a medium title bone
 * over a small subtitle bone in a flexing stack, beside an
 * inert ghost Button — a ghost Button skeletonizes as a text
 * bone inside a LoadingScope, so the action's place is kept
 * while loading. The row owns its shape; call sites render one
 * per loading row inside a LoadingScope and pass only the
 * action's label and accessible name.
 */
export function LoadingActionCardRow({ accessibilityLabel, children }: LoadingActionCardRowProps) {
  return (
    <Card variant="elevated" flexDirection="row" alignItems="center" gap={tokens.spacing[3]}>
      <YStack flex={1} minWidth={0} gap={tokens.spacing[1]}>
        <TextSkeleton size="md" lines={1} />
        <TextSkeleton size="sm" lines={1} />
      </YStack>
      <Button ghost size="sm" accessibilityLabel={accessibilityLabel} onPress={() => {}}>
        {children}
      </Button>
    </Card>
  );
}
