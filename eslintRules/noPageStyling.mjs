/**
 * design-system/no-page-styling — page components must not apply
 * styling directly (#119).
 *
 * Stephen's decisions (2026-10-24, on the issue):
 *
 * 1. A page (any file the config scopes this rule to — src/pages/**)
 *    must not set ANY styling prop on ANY element: not `className`,
 *    not the inline `style` prop, and no Tamagui styling prop — not
 *    even a design-system component's "designed" props (there is no
 *    exception for e.g. `Text color/fontSize`). Styling lives in
 *    reusable components under src/components, driven by semantic
 *    props: `<Alert intent="error">`, never
 *    `<div style={{ color: "red" }}>`.
 * 2. Tamagui layout primitives (View, Stack, XStack, YStack, ZStack,
 *    Spacer, Square, Circle, ScrollView) may only be rendered inside
 *    reusable DS components, so rendering one in a page is a violation
 *    by itself, whatever props it carries.
 * 3. Pass-through is a violation: a page forwarding styling it
 *    received down to a child — via an opaque spread (`{...props}`),
 *    or a spread whose visible keys include styling props
 *    (`{...(active ? { color: ... } : {})}`) — must be replaced with
 *    a semantic prop (e.g. `intent="danger"`). Spreads whose visible
 *    keys are all non-styling (data, callbacks, semantic props) are
 *    the codebase's conditional-prop idiom and stay allowed.
 * 4. Defining a component with `styled(...)` inside a page file is
 *    styling owned by the page — also a violation.
 *
 * What counts as a "styling prop" is name-based (see styleProps.mjs):
 * the Tamagui style-prop surface, plus any `$`-prefixed prop (media /
 * variant style props). Everything else — data, callbacks, semantic
 * props like `intent`/`variant`/`tone`, accessibility props — is
 * untouched. The deliberate consequence: reusable components must
 * expose semantic prop names, not style names, or pages cannot use
 * them. The `theme` prop is NOT treated as styling: it selects a
 * theme subtree (context), it does not style the element itself.
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
import { styleProps } from "./styleProps.mjs";

const layoutPrimitives = new Set([
  "Circle",
  "ScrollView",
  "Spacer",
  "Square",
  "Stack",
  "View",
  "XStack",
  "YStack",
  "ZStack",
]);

function isStylingProp(name) {
  return name.startsWith("$") || styleProps.has(name);
}

function elementName(node) {
  if (node.type === "JSXIdentifier") return node.name;
  if (node.type === "JSXMemberExpression") return elementName(node.object);
  return null;
}

function checkObjectKeys(context, node) {
  for (const property of node.properties) {
    if (property.type !== "Property") continue;
    const key = property.key.name ?? property.key.value;
    if (typeof key === "string" && isStylingProp(key)) {
      context.report({ node: property, messageId: "spreadStyling", data: { name: key } });
    }
  }
}

function checkSpreadArgument(context, node) {
  switch (node.type) {
    case "ObjectExpression": {
      checkObjectKeys(context, node);
      break;
    }
    case "ConditionalExpression": {
      checkSpreadArgument(context, node.consequent);
      checkSpreadArgument(context, node.alternate);
      break;
    }
    case "LogicalExpression": {
      checkSpreadArgument(context, node.right);
      break;
    }
    default: {
      context.report({ node, messageId: "spreadOpaque" });
    }
  }
}

function checkAttribute(context, attribute) {
  if (attribute.type === "JSXSpreadAttribute") {
    checkSpreadArgument(context, attribute.argument);
    return;
  }
  const { name } = attribute.name;
  switch (name) {
    case "className": {
      context.report({ node: attribute, messageId: "className" });
      break;
    }
    case "style": {
      context.report({ node: attribute, messageId: "styleProp" });
      break;
    }
    default: {
      if (isStylingProp(name)) {
        context.report({ node: attribute, messageId: "stylingProp", data: { name } });
      }
    }
  }
}

const noPageStyling = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Page components must not apply styling directly (className, style, Tamagui props, layout primitives, styling pass-through); styling belongs in reusable components behind semantic props.",
    },
    messages: {
      className:
        "Pages must not set className. Move the styling into a reusable component in src/components and pass semantic props instead.",
      styleProp:
        "Pages must not set the inline style prop. Move the styling into a reusable component in src/components and pass semantic props instead.",
      stylingProp:
        "'{{name}}' is a styling prop; pages must not set styling directly — not even a component's designed style props. Use a reusable component in src/components driven by semantic props (e.g. intent, variant) instead.",
      layoutPrimitive:
        "'{{name}}' is a Tamagui layout primitive; layout primitives may only be rendered inside reusable components in src/components, not in pages.",
      spreadStyling:
        "This spread forwards the styling prop '{{name}}' to a child. Pass-through of styling is a violation: replace it with a semantic prop (e.g. intent).",
      spreadOpaque:
        "Pages must not spread an opaque props object onto an element: it can forward styling props sight unseen. Pass explicit data, callbacks and semantic props instead.",
      styledCall:
        "Do not define styled() components in a page. Styled components belong in src/components, driven by semantic props.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = elementName(node.name);
        if (name !== null && layoutPrimitives.has(name)) {
          context.report({ node: node.name, messageId: "layoutPrimitive", data: { name } });
        }
        for (const attribute of node.attributes) checkAttribute(context, attribute);
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "styled") {
          context.report({ node, messageId: "styledCall" });
        }
      },
    };
  },
};

export default { rules: { "no-page-styling": noPageStyling } };
