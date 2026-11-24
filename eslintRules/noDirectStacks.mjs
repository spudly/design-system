/**
 * design-system/no-direct-stacks — layout composes through the
 * Row/Col/Spacer primitives, never through Tamagui's raw stacks
 * (#746).
 *
 * The #746 consolidation rebuilt every layout surface in the
 * library on three primitives — Row, Col, and Spacer
 * (src/widgets/layout) — whose prop subsets carry the DS spacing
 * scale and alignment vocabulary. Rendering an XStack or YStack
 * directly (or deriving one with styled()) reintroduces the
 * unconsolidated surface the tranches removed: raw numeric gaps,
 * free-form style props, and geometry the subset deliberately
 * cannot express. So this rule reports, in the files the config
 * scopes it to (src/widgets/**, src/views/**, src/pages/**,
 * src/icons/**):
 *
 * - A JSX element named XStack or YStack, including the
 *   member form (`<Tamagui.XStack>`).
 * - A styled() call deriving from one: `styled(XStack, {...})`,
 *   `styled(YStack, {...})`.
 *
 * Deliberately NOT reported (documented sight limits, mirroring
 * the sibling rules):
 *
 * - Type-only derivations: Card's props are
 *   `GetProps<typeof YStack>` — a type surface, not a rendered
 *   stack. The rule inspects JSX and styled() calls, not imports
 *   or type positions.
 * - Aliasing (`const R = XStack; <R />`): the rule is name-based
 *   and cannot follow a binding to its initializer; a raw stack
 *   under an alias is a code-review catch, the same limit the
 *   margin rule documents for opaque spreads.
 * - styled() derivations from non-stack primitives (styled
 *   Anchor, Input, Tabs parts, View, ...): those are not stacks
 *   and stay legal — several are load-bearing (pseudo-style
 *   props exist only on styled() configs in this Tamagui
 *   version).
 *
 * THE ALLOWLIST (config-level, in eslint.config.ts — the rule
 * itself takes no options):
 *
 * - src/widgets/layout/Row.tsx and src/widgets/layout/Col.tsx —
 *   the primitives' own implementations: Row renders an XStack
 *   and Col a YStack after resolving the subset props. They are
 *   the one sanctioned place a raw stack renders, because they
 *   ARE the subset enforcement.
 * - src/widgets/form/SearchField.tsx — Option B allowlist #1:
 *   the search container's focus-within ring needs pseudo-style
 *   props, which this Tamagui version accepts only in styled()
 *   configs, so its StyledContainer (styled XStack) is retained
 *   by Stephen's Option B ruling (2026-11-24). Everything else
 *   in the file composes through Row/Col.
 * - src/widgets/layout/MasonryGrid.tsx — PENDING STEPHEN'S
 *   DECISION: the masonry grid's runtime numeric gap fits no
 *   Row/Col prop combination, so the file is untouched and
 *   allowlisted until Stephen decides its shape. When he does,
 *   the exemption comes out with the conversion.
 *
 * Dormancy: like the sibling rules, this is wired at "error" in
 * eslint.config.ts but cannot fire today — the shared
 * `typescriptPendingIgnores` block ignores every .ts/.tsx file
 * (typescript-eslint has no TypeScript 7 parser yet). It
 * activates with no further change at the TS lint restoration
 * (eslint-config issue #8). The #746 tranches converted the
 * codebase proactively, so activation is a non-event.
 */

export const stackNames = new Set(["XStack", "YStack"]);

function jsxElementName(node) {
  const name = node.name;
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") return name.property.name;
  
}

const noDirectStacks = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Layout composes through Row/Col/Spacer: no direct XStack/YStack elements and no styled() derivations from them.",
    },
    messages: {
      stackElement:
        "<{{name}}> renders a raw Tamagui stack. Compose through Row/Col (src/widgets/layout) instead — their subsets carry the DS spacing scale and alignment vocabulary (#746).",
      stackStyled:
        "styled({{name}}, ...) derives a raw Tamagui stack. Rebuild the root as a function component rendering Row/Col instead (#746, Option B); a minimal styled non-stack primitive inside it stays legal where pseudo-styles genuinely need one.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = jsxElementName(node);
        if (name !== undefined && stackNames.has(name)) {
          context.report({ node, messageId: "stackElement", data: { name } });
        }
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "styled") return;
        const base = node.arguments[0];
        if (base?.type === "Identifier" && stackNames.has(base.name)) {
          context.report({ node, messageId: "stackStyled", data: { name: base.name } });
        }
      },
    };
  },
};

export default { rules: { "no-direct-stacks": noDirectStacks } };
