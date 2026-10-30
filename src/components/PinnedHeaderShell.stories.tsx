import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { PinnedHeaderShell } from "./PinnedHeaderShell.js";
import { ScrollRegion } from "./ScrollRegion.js";
import { SectionStack } from "./SectionStack.js";
import { Tabs } from "./Tabs.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PinnedHeaderShell> = {
  title: "Components/PinnedHeaderShell",
  component: PinnedHeaderShell,
};

export default meta;
type Story = StoryObj<typeof PinnedHeaderShell>;

const lines = Array.from({ length: 10 }, (_, index) => (
  <Text key={index}>Content line {index + 1} — the header stays pinned while this scrolls.</Text>
));

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} height={480}>
      <PinnedHeaderShell
        header={
          <SectionStack>
            <Text variant="title">Meals</Text>
            <Tabs
              tabs={[
                { value: "meals", label: "Meals" },
                { value: "plans", label: "Plans" },
              ]}
              value="meals"
              onValueChange={() => {}}
            />
          </SectionStack>
        }
      >
        <ScrollRegion>
          <YStack padding={tokens.spacing[4]} gap={tokens.spacing[3]}>
            {lines}
          </YStack>
        </ScrollRegion>
      </PinnedHeaderShell>
    </YStack>
  ),
};
