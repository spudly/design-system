import { XStack, YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { Center } from "../layout/Center.js";
import { CircleSkeleton } from "./CircleSkeleton.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "./TextSkeleton.js";

export type RadioSkeletonRowProps = {
  /** Whether the mirrored option carries a description line. */
  description?: boolean;
};

/**
 * One radio option's loading mirror (#278, #698 tranche 3):
 * a circle bone centered in the radio item's 44px
 * touch-target slot, with a label bone at md centered in
 * the option label's own line box (SIZABLE_TEXT_LINE_BOX —
 * a plain md line box left each row short and the drift
 * accumulated down the group, Stephen on #579) and a
 * description bone at sm when the option carries one. No
 * real label or selection shows.
 */
export function RadioSkeletonRow({ description = false }: RadioSkeletonRowProps) {
  return (
    <XStack alignItems="center" gap={tokens.spacing[2]}>
      <Center width={44} height={44}>
        <CircleSkeleton size={20} />
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
