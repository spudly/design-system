import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, XStack, YStack } from "tamagui";
import { iconsByName, type IconName } from "../icons/iconRegistry.js";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Dropdown, useDropdownClose } from "./Dropdown.js";
import { DropdownButton } from "./DropdownButton.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Dropdown> = {
  title: "Widgets/Dropdown",
  component: Dropdown,
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

/**
 * A composed menu row, the way a DS page would build one inside the
 * dropdown's children slot: a pressable row (button semantics,
 * 44px minimum height, web keyboard activation — the AccordionSection
 * header pattern) whose activation reports out and closes the menu
 * through useDropdownClose (close-on-select).
 */
function MenuRow({
  icon,
  label,
  destructive = false,
  onAction,
}: {
  icon?: IconName;
  label: string;
  destructive?: boolean;
  onAction: (label: string) => void;
}) {
  const Icon = icon !== undefined ? iconsByName[icon] : undefined;
  const close = useDropdownClose();
  const activate = () => {
    onAction(label);
    close();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };
  return (
    <XStack
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel: label,
      })}
      onPress={activate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      cursor="web:pointer"
      alignItems="center"
      gap={tokens.spacing[2]}
      minHeight={44}
      paddingHorizontal={tokens.spacing[3]}
      paddingVertical={tokens.spacing[2]}
      borderRadius={tokens.radii.md}
    >
      {Icon ? (
        <Icon
          size={18}
          color={destructive ? tokens.colors.danger.danger7 : tokens.colors.gray.gray10}
        />
      ) : null}
      <Text style={destructive ? { color: tokens.colors.danger.danger7 } : undefined}>{label}</Text>
    </XStack>
  );
}

function RecipeActionsMenu() {
  const [lastAction, setLastAction] = useState("none yet");
  return (
    <YStack gap={tokens.spacing[3]}>
      <Dropdown
        accessibilityLabel="Recipe actions"
        trigger={<DropdownButton label="Recipe actions" />}
      >
        <YStack>
          <MenuRow icon="print" label="Print recipe" onAction={setLastAction} />
          <MenuRow icon="share" label="Share recipe" onAction={setLastAction} />
          <MenuRow label="Duplicate recipe" onAction={setLastAction} />
          <MenuRow label="Delete recipe" destructive onAction={setLastAction} />
        </YStack>
      </Dropdown>
      <Text variant="hint">Last action: {lastAction}</Text>
    </YStack>
  );
}

export const ActionMenu: Story = {
  render: () => <RecipeActionsMenu />,
};

export const IconOnlyTrigger: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Account menu"
      trigger={<DropdownButton icon="profile" accessibilityLabel="Account menu" />}
    >
      <YStack>
        <MenuRow label="Profile" onAction={() => undefined} />
        <MenuRow label="Sign out" onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <XStack justifyContent="flex-end">
      <Dropdown
        accessibilityLabel="Card actions"
        trigger={<DropdownButton label="Card actions" />}
        align="end"
      >
        <YStack>
          <MenuRow label="Open" onAction={() => undefined} />
          <MenuRow label="Remove from board" destructive onAction={() => undefined} />
        </YStack>
      </Dropdown>
    </XStack>
  ),
};

export const SideTop: Story = {
  render: () => (
    <YStack paddingTop={160}>
      <Dropdown
        accessibilityLabel="Upward menu"
        trigger={<DropdownButton label="Opens upward" />}
        side="top"
      >
        <YStack>
          <MenuRow label="First row" onAction={() => undefined} />
          <MenuRow label="Second row" onAction={() => undefined} />
        </YStack>
      </Dropdown>
    </YStack>
  ),
};

export const InitiallyOpen: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Recipe actions"
      trigger={<DropdownButton label="Recipe actions" />}
      defaultOpen
    >
      <YStack>
        <MenuRow icon="print" label="Print recipe" onAction={() => undefined} />
        <MenuRow icon="share" label="Share recipe" onAction={() => undefined} />
        <MenuRow label="Delete recipe" destructive onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};

function ControlledMenu() {
  const [open, setOpen] = useState(false);
  return (
    <YStack gap={tokens.spacing[3]}>
      <Dropdown
        accessibilityLabel="Controlled menu"
        trigger={<DropdownButton label="Controlled menu" />}
        open={open}
        onOpenChange={setOpen}
      >
        <YStack>
          <MenuRow label="Only row" onAction={() => undefined} />
        </YStack>
      </Dropdown>
      <Text variant="hint">Menu is {open ? "open" : "closed"}</Text>
      <Button variant="secondary" size="sm" onPress={() => setOpen(true)}>
        Open from outside
      </Button>
    </YStack>
  );
}

export const Controlled: Story = {
  render: () => <ControlledMenu />,
};

/**
 * The unequal-width case, panel wider (#474): a short trigger over
 * long menu rows. Only the aligned (leading) touching corners
 * square; the panel's far corner keeps its rounding where it
 * overhangs the trigger and touches nothing.
 */
export const WidePanelShortButton: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Wide panel menu"
      trigger={<DropdownButton label="More" />}
      defaultOpen
    >
      <YStack>
        <MenuRow label="Move this recipe to another collection" onAction={() => undefined} />
        <MenuRow label="Remove from this week's meal plan" onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};

/**
 * The unequal-width case, trigger wider (#474): a long trigger
 * label over short rows (the panel sits at its 200px minimum).
 * Only the aligned touching corners square; the trigger's far
 * corner keeps its rounding where the panel falls short.
 */
export const WideButtonShortPanel: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Wide button menu"
      trigger={<DropdownButton label="Recipe actions for this week" />}
      defaultOpen
    >
      <YStack>
        <MenuRow label="Open" onAction={() => undefined} />
        <MenuRow label="Print" onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};

/**
 * A menu row whose label renders in the TRIGGER's typography —
 * body family, md size, semibold weight (the Button label's own)
 * instead of MenuRow's regular-weight body text — with a trailing
 * spacer after the label. It mirrors MenuRow's geometry and
 * behavior exactly; only the label's weight and the spacer differ.
 * It exists for the equal-width fixture below: the spacer is sized
 * so the panel the row drives lands exactly on the trigger's
 * width (see that story's comment for the arithmetic).
 */
function MatchedWidthRow({
  label,
  onAction,
}: {
  label: string;
  onAction: (label: string) => void;
}) {
  const close = useDropdownClose();
  const activate = () => {
    onAction(label);
    close();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };
  return (
    <XStack
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel: label,
      })}
      onPress={activate}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      cursor="web:pointer"
      alignItems="center"
      gap={tokens.spacing[2]}
      minHeight={44}
      paddingHorizontal={tokens.spacing[3]}
      paddingVertical={tokens.spacing[2]}
      borderRadius={tokens.radii.md}
    >
      <Text fontWeight={tokens.typography.fontWeight.semibold}>{label}</Text>
      <View width={tokens.spacing[3]} />
    </XStack>
  );
}

/**
 * The equal-width case (#474): the button and the dropdown come
 * out the SAME width, so the measured widths match and BOTH
 * touching corner pairs square — button and panel read as one
 * continuous surface, with no rounded far corner on either.
 *
 * The match is by construction, not by eye. The widest row repeats
 * the trigger's label in the trigger's own typography, so the same
 * text run drives both widths and cancels out of the difference.
 * What remains is each frame's fixed extras: the trigger's border
 * + horizontal padding + label/chevron gap + chevron
 * (2 + 32 + 8 + 20 = 62) against the panel's border + padding +
 * row padding (2 + 16 + 24 = 42) — and the row's trailing spacer
 * plus the gap before it (12 + 8 = 20) covers exactly that
 * difference. The label is long enough that the panel's content
 * clears its 200px minimum, so the minimum never drives the
 * panel's width.
 */
export const EqualWidthButtonAndPanel: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Add to collection menu"
      trigger={<DropdownButton label="Add recipe to a collection" />}
      defaultOpen
    >
      <YStack>
        <MatchedWidthRow label="Add recipe to a collection" onAction={() => undefined} />
        <MenuRow label="Print recipe" onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};

/**
 * The button-wider case (#474), by a decisive margin: a long
 * trigger label over minimal rows, so the panel sits at its 200px
 * minimum while the button runs far past it. Only the aligned
 * (leading) touching corners square; the panel's far corner keeps
 * its rounding where it falls short of the button's edge and
 * touches nothing.
 */
export const ButtonWiderThanPanel: Story = {
  render: () => (
    <Dropdown
      accessibilityLabel="Meal plan actions"
      trigger={<DropdownButton label="Recipe actions for this week's meal plan" />}
      defaultOpen
    >
      <YStack>
        <MenuRow label="Open" onAction={() => undefined} />
        <MenuRow label="Print" onAction={() => undefined} />
      </YStack>
    </Dropdown>
  ),
};
