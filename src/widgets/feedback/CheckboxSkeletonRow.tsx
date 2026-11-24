import { XStack, YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { Center } from "../layout/Center.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "./TextSkeleton.js";

export type CheckboxSkeletonRowProps = {
  /** Whether the mirrored field carries a description line. */
  description?: boolean;
};

/**
 * One checkbox field's loading mirror (#278, #698 tranche
 * 3): the field's own row (gap spacing 3, 44px minimum) —
 * the 24px visual box bone centered in its 44px
 * touch-target slot, the label bone at md centered in the
 * field label's own line box (SIZABLE_TEXT_LINE_BOX, 27),
 * and a description bone at sm when a description would
 * render. No real label or checked state shows.
 */
export function CheckboxSkeletonRow({ description = false }: CheckboxSkeletonRowProps) {
  return (
    <XStack alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
      <Center width={44} height={44}>
        <BoxSkeleton width={24} height={24} />
      </Center>
      <YStack flex={1} gap={tokens.spacing[1]}>
        <Center height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
          <TextSkeleton size="md" lines={1} />
        </Center>
        {description ? <TextSkeleton size="sm" lines={1} /> : null}
      </YStack>
    </XStack>
  );
}
