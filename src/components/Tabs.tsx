import { Tabs as TamaguiTabs, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledList = styled(TamaguiTabs.List, {
  name: "SpudlyTabsList",

  gap: tokens.spacing[1],
  borderBottomWidth: 1,
  borderBottomColor: "$borderColor",
});

const StyledTab = styled(TamaguiTabs.Tab, {
  name: "SpudlyTabsTab",

  paddingHorizontal: tokens.spacing[3],
  paddingVertical: tokens.spacing[2],
  minHeight: 44,
  justifyContent: "center",
  borderBottomWidth: 2,
  borderBottomColor: "transparent",

  variants: {
    active: {
      true: {
        borderBottomColor: "$primary",
      },
    },
  } as const,
});

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Accessible tab navigation built on Tamagui Tabs (tablist semantics,
 * arrow-key navigation, and `aria-selected` come from the primitive).
 * Render panels conditionally on `value`:
 *
 *   const [tab, setTab] = useState("overview");
 *   <Tabs tabs={[...]} value={tab} onValueChange={setTab} />
 *   {tab === "overview" && <OverviewPanel />}
 */
export function Tabs({ tabs, value, onValueChange }: TabsProps) {
  return (
    <TamaguiTabs value={value} onValueChange={onValueChange} orientation="horizontal">
      <StyledList>
        {tabs.map((tab) => (
          <StyledTab key={tab.value} value={tab.value} active={tab.value === value}>
            <Text
              variant="body"
              style={{
                fontWeight:
                  tab.value === value
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.regular,
                color: tab.value === value ? "$primaryEmphasis" : "$textMuted",
              }}
            >
              {tab.label}
            </Text>
          </StyledTab>
        ))}
      </StyledList>
    </TamaguiTabs>
  );
}
