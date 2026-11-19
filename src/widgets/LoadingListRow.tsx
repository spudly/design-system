import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { TextSkeleton } from "./TextSkeleton.js";

/**
 * A check list's loading row (#119, #278): a 24px box bone — the
 * skeleton shape of a CheckRow's checkbox — beside a medium text
 * bone flexing to the row's width, on the list row's own rhythm:
 * 12px vertical padding, a 12px gap, top-aligned, and a
 * transparent 1px bottom border matching the loaded rows'
 * hairline slot (the loading list renders no visible rule). The
 * row owns its shape and rhythm; call sites render one per
 * loading row inside a LoadingScope and pass nothing.
 */
export function LoadingListRow() {
  return (
    <XStack
      alignItems="flex-start"
      gap={tokens.spacing[3]}
      paddingVertical={tokens.spacing[3]}
      borderBottomWidth={1}
      borderBottomColor="transparent"
    >
      <BoxSkeleton width={24} height={24} />
      <YStack flex={1}>
        <TextSkeleton size="md" lines={1} />
      </YStack>
    </XStack>
  );
}
