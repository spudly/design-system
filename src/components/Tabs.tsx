import { Anchor, Tabs as TamaguiTabs, XStack, isWeb, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const listFrameStyles = {
  gap: tokens.spacing[1],
  borderBottomWidth: 1,
  borderBottomColor: "$borderColor",
} as const;

const StyledList = styled(TamaguiTabs.List, {
  name: "TabsList",
  ...listFrameStyles,
});

const StyledLinkList = styled(XStack, {
  name: "TabsLinkList",
  ...listFrameStyles,
});

/**
 * The tab frame's styling: ONE base shared by the two tab frames
 * Tabs renders, so the variants cannot drift:
 *
 * - `StyledTab` (the button variant): a Tamagui Tabs tab — tablist
 *   semantics from the primitive; activation switches in-page
 *   content through `onValueChange`.
 * - `StyledLinkTab` (the link variant, #248): a Tamagui Anchor with
 *   the same frame — a real `<a href>` on web; on native a press
 *   opens the href through the platform link path (Tamagui's Anchor
 *   calls Linking.openURL internally, so no DS component imports
 *   react-native).
 */
const tabFrameStyles = {
  paddingHorizontal: tokens.spacing[3],
  paddingVertical: tokens.spacing[2],
  minHeight: 44,
  justifyContent: "center",
  borderBottomWidth: 2,
  borderBottomColor: "transparent",
} as const;

const StyledTab = styled(TamaguiTabs.Tab, {
  name: "TabsTab",
  ...tabFrameStyles,

  variants: {
    active: {
      true: {
        borderBottomColor: "$primary",
      },
    },
  } as const,
});

const StyledLinkTab = styled(Anchor, {
  name: "TabsLinkTab",
  ...tabFrameStyles,

  // The link tab's label is the anchor's own text (the button
  // variant sets these on its nested Text instead): the DS Text
  // body's size, with the active state carrying the same $link +
  // semibold treatment the button variant's selected label uses.
  fontSize: tokens.typography.fontSize.md,

  variants: {
    active: {
      true: {
        borderBottomColor: "$primary",
        color: "$link",
        fontWeight: tokens.typography.fontWeight.semibold,
      },
      false: {
        color: "$textMuted",
        fontWeight: tokens.typography.fontWeight.regular,
      },
    },
  } as const,
});

export type TabItem = {
  value: string;
  label: string;
};

export type LinkTabItem = {
  value: string;
  label: string;
  /** The tab's destination — a link tab navigates (#248). */
  href: string;
};

export type TabsProps =
  | {
      /**
       * Button variant (the default): the tabs switch in-page
       * content — buttons with a callback, per the navigation rule.
       */
      variant?: "button";
      tabs: TabItem[];
      value: string;
      onValueChange: (value: string) => void;
    }
  | {
      /**
       * Link variant: the tabs navigate to other pages — links with
       * hrefs, per the navigation rule. `value` names the current
       * page's tab (the host derives it from the route); there is
       * no change callback, because navigation itself is the
       * activation.
       */
      variant: "link";
      tabs: LinkTabItem[];
      value: string;
      onValueChange?: never;
    };

/**
 * Tab navigation in two variants (#248's navigation rule, and
 * Stephen's tabs ruling on it: a tab that navigates to another page
 * is a link; a tab that stays on the same page is a button — like
 * Button and TextLink, the component ships both forms):
 *
 * - Button variant (default): accessible in-page tabs built on
 *   Tamagui Tabs (tablist semantics, arrow-key navigation, and
 *   `aria-selected` come from the primitive). Render panels
 *   conditionally on `value`:
 *
 *     const [tab, setTab] = useState("overview");
 *     <Tabs tabs={[...]} value={tab} onValueChange={setTab} />
 *     {tab === "overview" && <OverviewPanel />}
 *
 * - Link variant (`variant="link"`): each tab is a real anchor
 *   carrying its item's `href` (the platform link path on native),
 *   styled with the same frame and active treatment; the current
 *   page's tab (`value`) is marked `aria-current="page"` on web and
 *   selected on native. Use it for section navigation (the app
 *   sections a tab bar switches between when each is its own page).
 */
export function Tabs(props: TabsProps) {
  if (props.variant === "link") {
    const { tabs, value } = props;
    return (
      <StyledLinkList>
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <StyledLinkTab
              key={tab.value}
              href={tab.href}
              active={active}
              {...(isWeb
                ? { "aria-current": active ? ("page" as const) : undefined }
                : { accessibilityState: { selected: active } })}
            >
              {tab.label}
            </StyledLinkTab>
          );
        })}
      </StyledLinkList>
    );
  }
  const { tabs, value, onValueChange } = props;
  return (
    <TamaguiTabs value={value} onValueChange={onValueChange} orientation="horizontal">
      <StyledList>
        {tabs.map((tab) => (
          <StyledTab key={tab.value} value={tab.value} active={tab.value === value}>
            {/* Selected label uses $link, not $primaryEmphasis:
                $primaryEmphasis has no dark variant and drops to
                ~2.3:1 on dark backgrounds, while the dark-aware $link
                holds ≥5:1 in every brand and mode. */}
            <Text
              variant="body"
              style={{
                fontWeight:
                  tab.value === value
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.regular,
                color: tab.value === value ? "$link" : "$textMuted",
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
