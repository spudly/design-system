import { Anchor, Tabs as TamaguiTabs, XStack, isWeb, styled, useTheme } from "tamagui";
import { iconsByName, type IconName } from "../icons/iconRegistry.js";
import { tokens } from "../tokens/index.js";
import { navigationRoleProps, platformAccessibilityProps } from "./accessibility.js";
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

  // Row layout so a tab's optional icon glyph (button variant,
  // #438 Part 5) sits left of its label with the shared item gap;
  // inert for a label-only tab (a single child lays out the same).
  flexDirection: "row",
  alignItems: "center",
  gap: tokens.spacing[2],

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
  // A web anchor carries the UA link underline; the button
  // variant's tab labels have none, and the variants are
  // contracted to look identical (manual Storybook QA finding on
  // PR #283).
  textDecorationLine: "none",

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

type TabItem = {
  value: string;
  label: string;
  /**
   * The tab's icon, as a NAME from the design system's semantic
   * icon set (#438 Part 4's registry) — data, never a component:
   * Tabs resolves the name and renders the glyph left of the
   * label, inked to match the label (the active tab's $link,
   * otherwise $textMuted). The glyph is decorative; the label is
   * the tab's accessible name. Button-variant only, mirroring
   * Button's contract: the href (link) form takes no icon (its
   * props omit the slot the way ButtonLinkProps does).
   */
  icon?: IconName;
};

type LinkTabItem = {
  value: string;
  label: string;
  /**
   * The tab's destination — a link tab navigates (#248). Native
   * contract (shared by every DS href form): the href is forwarded
   * verbatim to the platform link path (`Linking.openURL`), which
   * requires a scheme-bearing URL an installed app can open — so
   * on native the host passes absolute URLs (the app's deep-link
   * scheme or https URLs); root-relative paths are web-form
   * destinations. The design system has no base URL or router to
   * resolve a relative path against, so composing the
   * per-platform destinations is the host's part of the contract.
   */
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
      /** The tab list's accessible name (e.g. "Memorize sections"). */
      label?: string;
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
      /** The tab list's accessible name (e.g. "Memorize sections"). */
      label?: string;
    };

/**
 * The concrete ink for a tab glyph: the label's theme color
 * resolved through the active theme (the glyph renders in SVG,
 * where theme token strings do not resolve), with the same
 * fallbacks Button's glyph ink uses. Active tabs take $link,
 * inactive $textMuted — the label's own colors.
 */
function useTabGlyphInks(): { active: string; inactive: string } {
  const theme = useTheme();
  const roleValue = (key: string): string | undefined => {
    const variable = theme[key];
    return typeof variable?.val === "string" ? variable.val : undefined;
  };
  return {
    active: roleValue("link") ?? tokens.colors.primary.primary8,
    inactive: roleValue("textMuted") ?? tokens.colors.gray.gray10,
  };
}

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
 *
 * A button-variant tab may carry an icon NAME (#438 Part 4's
 * registry — see TabItem.icon); the link variant takes no icon,
 * mirroring Button (its href form omits the icon slot). Both
 * variants accept `label`, the tab list's accessible name — the
 * button list exposes it through its tablist role; the link list
 * through the web navigation landmark (navigationRoleProps).
 */
export function Tabs(props: TabsProps) {
  const glyphInks = useTabGlyphInks();
  if (props.variant === "link") {
    const { tabs, value, label } = props;
    return (
      <StyledLinkList
        {...navigationRoleProps}
        {...platformAccessibilityProps({ accessibilityLabel: label })}
      >
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
  const { tabs, value, onValueChange, label } = props;
  return (
    <TamaguiTabs value={value} onValueChange={onValueChange} orientation="horizontal">
      <StyledList {...platformAccessibilityProps({ accessibilityLabel: label })}>
        {tabs.map((tab) => {
          const active = tab.value === value;
          const Glyph = tab.icon !== undefined ? iconsByName[tab.icon] : undefined;
          return (
            <StyledTab
              key={tab.value}
              value={tab.value}
              active={active}
              // #454: Tamagui's headless useTab puts a generated
              // panel id in every tab's aria-controls, but this
              // widget renders triggers only — no tabpanel ever
              // exists for a consumer to pair with (the id is a
              // per-instance useId value, so a host cannot render
              // a matching panel either). Suppress the dangling
              // reference at the widget level; caller props spread
              // after the primitive's a11y props in Tamagui's Tab,
              // so an explicit undefined wins. Consumers render
              // their panels conditionally on `value` (see the
              // Tabs doc comment) without a controls pairing.
              {...{ "aria-controls": undefined }}
            >
              {Glyph ? (
                <Glyph size={20} color={active ? glyphInks.active : glyphInks.inactive} />
              ) : null}
              {/* Selected label uses $link, not $primaryEmphasis:
                $primaryEmphasis has no dark variant and drops to
                ~2.3:1 on dark backgrounds, while the dark-aware $link
                holds ≥5:1 in every brand and mode. */}
              <Text
                variant="body"
                style={{
                  fontWeight: active
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.regular,
                  color: active ? "$link" : "$textMuted",
                }}
              >
                {tab.label}
              </Text>
            </StyledTab>
          );
        })}
      </StyledList>
    </TamaguiTabs>
  );
}
