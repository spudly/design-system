/**
 * design-system/no-page-styling — page components must not apply
 * styling directly (#119, simplified shape per #297).
 *
 * Stephen's decision (2026-11-03, on #297): the rule enforces
 * exactly three things for a page (any file the config scopes this
 * rule to — src/pages/**):
 *
 * 1. No direct Tamagui imports: a page must not import from
 *    `tamagui` or any `@tamagui/*` package. Tamagui elements and
 *    layout primitives live inside reusable components under
 *    src/components; pages compose those components.
 * 2. No `className` on any element.
 * 3. No inline `style` prop on any element.
 *
 * Styling lives in reusable components, driven by semantic props:
 * `<Alert intent="error">`, never `<div style={{ color: "red" }}>`.
 *
 * The original 2026-10-24 shape also enumerated Tamagui's style
 * props (via stylePropsAll) and banned them on every element.
 * Stephen superseded that part on #297: Tamagui elements are
 * already import-banned in pages, DOM elements do not accept
 * Tamagui style props, and design-system components are
 * contractually barred from accepting styling props — so the prop
 * list guarded a case the other rules already close. Protection
 * against styling props on a DS component's designed props (the
 * old `Text color/fontSize` case) now rests on the DS component
 * contract itself, not on this rule. (styleProps.mjs remains in
 * the repo: the no-margin-spacing rule still derives its margin
 * set from it.)
 *
 * Dormancy: this repo's eslint.config.ts wires the rule at "error"
 * for src/pages/**, but typescript-eslint has no TypeScript 7 parser
 * yet, so the shared `typescriptPendingIgnores` block ignores every
 * .ts/.tsx file and the rule cannot fire in CI today. It activates
 * with no further change the moment the TS lint restoration removes
 * that ignores block (eslint-config issue #8 tracks the restoration).
 * The page fixes land proactively from the audit on #119, so enabling
 * it is a non-event.
 */

function isTamaguiSource(source) {
  return (
    source === "tamagui" || source.startsWith("tamagui/") || source.startsWith("@tamagui/")
  );
}

function checkAttribute(context, attribute) {
  if (attribute.type !== "JSXAttribute") return;
  const { name } = attribute.name;
  if (name === "className") {
    context.report({ node: attribute, messageId: "className" });
  } else if (name === "style") {
    context.report({ node: attribute, messageId: "styleProp" });
  }
}

const noPageStyling = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Page components must not apply styling directly: no direct Tamagui imports, no className, no inline style prop; styling belongs in reusable components behind semantic props.",
    },
    messages: {
      tamaguiImport:
        "Pages must not import from '{{source}}' directly. Tamagui belongs inside reusable components in src/components; pages compose those components with semantic props instead.",
      className:
        "Pages must not set className. Move the styling into a reusable component in src/components and pass semantic props instead.",
      styleProp:
        "Pages must not set the inline style prop. Move the styling into a reusable component in src/components and pass semantic props instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isTamaguiSource(node.source.value)) {
          context.report({
            node,
            messageId: "tamaguiImport",
            data: { source: node.source.value },
          });
        }
      },
      ImportExpression(node) {
        if (node.source.type === "Literal" && isTamaguiSource(node.source.value)) {
          context.report({
            node,
            messageId: "tamaguiImport",
            data: { source: node.source.value },
          });
        }
      },
      JSXOpeningElement(node) {
        for (const attribute of node.attributes) checkAttribute(context, attribute);
      },
    };
  },
};

export default { rules: { "no-page-styling": noPageStyling } };
