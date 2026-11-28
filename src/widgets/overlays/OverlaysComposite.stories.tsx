import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";

import { tokens } from "../../tokens/index.js";
import { Button } from "../actions/Button.js";
import { Text } from "../data/Text.js";

import { Accordion, type AccordionItem } from "./Accordion.js";
import { Collapsible } from "./Collapsible.js";
import { Dialog } from "./Dialog.js";
import { SearchHelpPopover, type SearchHelpEntry } from "./SearchHelpPopover.js";
import { StepOverlay } from "./StepOverlay.js";

/**
 * Composite story (#711): every overlays & disclosure widget
 * rendered together, so cross-widget inconsistencies — disclosure
 * header treatments between accordion and collapsible, overlay
 * surfaces and scrims across dialog, popover, and step overlay —
 * are visible at a glance instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Overlays & Disclosure/Composite: Overlays & Disclosure",
};

export default meta;
type Story = StoryObj;

const CONTENT = "This is a disclosure section. ".repeat(6);

const FAQ_SECTIONS: AccordionItem[] = [
  { value: "what", title: "What is this?", content: <Text>{CONTENT}</Text> },
  { value: "how", title: "How does it work?", content: <Text>{CONTENT}</Text> },
  { value: "when", title: "When should I use it?", content: <Text>{CONTENT}</Text> },
  { value: "cost", title: "What does it cost?", content: <Text>{CONTENT}</Text> },
];

const SEARCH_ENTRIES: SearchHelpEntry[] = [
  { syntax: "title:", description: "Match words in the title, e.g. title:soup." },
  { syntax: "ingredient:", description: "Match recipes using an ingredient." },
  { syntax: "tag:", description: "Match a tag." },
  { syntax: '"quoted phrase"', description: "Match the exact phrase." },
  { syntax: "calories:<600", description: "Match under a calorie limit." },
];

const STEPS = [
  "Brown the beef with the taco seasoning, breaking it apart until cooked through, about 8 minutes.",
  "Warm the tortillas in a dry skillet until pliable, about 30 seconds per side.",
  "Fill each tortilla with the beef, fold, and serve with your toppings.",
];

/** The disclosure family together: an accordion with its first
 * section open, a collapsible region under its toggle, and the
 * search-help popover open — header, chevron, and surface
 * treatments side by side. */
export const Disclosure: Story = {
  render: () => {
    const [isOpen, setOpen] = useState(true);
    return (
      <YStack maxWidth={430} gap={20}>
        <Accordion sections={FAQ_SECTIONS} defaultOpenValue="what" />
        <YStack gap={tokens.spacing[2]}>
          <Button
            variant="secondary"
            alignSelf="flex-start"
            onPress={() => {
              setOpen(!isOpen);
            }}
          >
            Toggle details
          </Button>
          <Collapsible isOpen={isOpen}>
            <Text>{CONTENT}</Text>
          </Collapsible>
        </YStack>
        <SearchHelpPopover
          label="Search syntax"
          title="Search syntax"
          intro="Combine these in the search field to narrow results."
          entries={SEARCH_ENTRIES}
          defaultOpen
        />
      </YStack>
    );
  },
};

/** The dialog in its open state, framed: title, description,
 * body, and actions as a user meets them mid-task. */
export const DialogOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <YStack height={360} maxWidth={480}>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Delete this recipe?"
          description="This cannot be undone."
          actions={
            <>
              <Button variant="secondary" size="sm" onPress={() => { setOpen(false); }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onPress={() => { setOpen(false); }}>
                Delete
              </Button>
            </>
          }
        >
          <Text variant="body">
            “Creamy Tuscan Garlic Chicken” will be removed from your library.
          </Text>
        </Dialog>
        {open ? null : <Text variant="hint">Dialog closed — reload the story to reopen.</Text>}
      </YStack>
    );
  },
};

/** The step overlay filling its frame, as in cook mode: title,
 * step position, body, and the step dots beneath. */
export const StepOverlayOpen: Story = {
  render: () => {
    const [stepIndex, setStepIndex] = useState(0);
    return (
      <YStack maxWidth={430}>
        <YStack height={420} position="relative">
          <StepOverlay
            title="Beef tacos"
            stepLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
            body={STEPS[stepIndex] ?? ""}
            onDone={() => { /* noop */ }}
          >
            <XStack gap={tokens.spacing[2]} justifyContent="center" paddingBlockEnd="$6">
              {STEPS.map((step, index) => (
                <YStack
                  key={step}
                  width={tokens.spacing[2]}
                  height={tokens.spacing[2]}
                  borderRadius={tokens.radii.full}
                  backgroundColor="$surface"
                  opacity={index === stepIndex ? 1 : 0.35}
                />
              ))}
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Button
                variant="secondary"
                size="sm"
                disabled={stepIndex === 0}
                onPress={() => { setStepIndex((current) => Math.max(0, current - 1)); }}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={stepIndex === STEPS.length - 1}
                onPress={() => { setStepIndex((current) => Math.min(STEPS.length - 1, current + 1)); }}
              >
                Next
              </Button>
            </XStack>
          </StepOverlay>
        </YStack>
      </YStack>
    );
  },
};
