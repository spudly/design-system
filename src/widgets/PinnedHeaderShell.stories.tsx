import type { Meta, StoryObj } from "@storybook/react";
import { ScrollView, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { PinnedHeaderShell } from "./PinnedHeaderShell.js";
import { SectionStack } from "./SectionStack.js";
import { Tabs } from "./Tabs.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PinnedHeaderShell> = {
  title: "Widgets/PinnedHeaderShell",
  component: PinnedHeaderShell,
};

export default meta;
type Story = StoryObj<typeof PinnedHeaderShell>;

// Enough lines to overflow the 480px frame decisively: the one
// behavior this story exists to demonstrate — the content
// scrolling under the pinned header — only occurs when the
// content region actually overflows (#723). Ten short lines fit
// inside the frame, so nothing ever scrolled and the header
// appeared to scroll away with the page.
const lines = Array.from({ length: 30 }, (_, index) => (
  <Text key={index}>Content line {index + 1} — scroll the content: the Meals header and tabs stay put.</Text>
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
        {/*
          Story-local bounded scroller (#723, plan Option A): on
          web, ScrollRegion deliberately renders no scroller (the
          #547 page-scroll model — the document scrolls the whole
          page), so it cannot demonstrate pinning inside a bound
          frame. This ScrollView stands in for the self-scrolling
          page a real consumer composes under the shell — the
          MealPlansPage role inside MealsHubPage's plans tab —
          which is exactly the composition the shell's contract
          describes: the header sits outside the scroller, the
          content scrolls itself. `minHeight: 0` lets the flex
          scroller shrink below its content height inside the
          bound frame — without it the scroller grows to fit its
          content and the document scrolls instead.
        */}
        <ScrollView flex={1} minHeight={0}>
          <YStack padding={tokens.spacing[4]} gap={tokens.spacing[3]}>
            {lines}
          </YStack>
        </ScrollView>
      </PinnedHeaderShell>
    </YStack>
  ),
};
