import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { PrintIcon } from "../icons/PrintIcon.js";
import { ProfileIcon } from "../icons/ProfileIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";
import type { IconComponentProps } from "../icons/Icon.js";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Dropdown, useDropdownClose } from "./Dropdown.js";
import { DropdownButton } from "./DropdownButton.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
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
  icon: Icon,
  label,
  destructive = false,
  onAction,
}: {
  icon?: ComponentType<IconComponentProps>;
  label: string;
  destructive?: boolean;
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
          <MenuRow icon={PrintIcon} label="Print recipe" onAction={setLastAction} />
          <MenuRow icon={ShareIcon} label="Share recipe" onAction={setLastAction} />
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
      trigger={<DropdownButton icon={ProfileIcon} accessibilityLabel="Account menu" />}
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
        <MenuRow icon={PrintIcon} label="Print recipe" onAction={() => undefined} />
        <MenuRow icon={ShareIcon} label="Share recipe" onAction={() => undefined} />
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
