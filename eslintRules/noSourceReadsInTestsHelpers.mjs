/**
 * Helpers for design-system/no-source-reads-in-tests (#772): the
 * static path analysis the rule runs over a read call's target —
 * which string fragments an expression can produce, whether those
 * fragments name a JS/TS source file (and not the audit's LEGIT
 * class: dist output and declaration files), and whether an
 * expression derives from a `readdirSync` enumeration. Split out of
 * noSourceReadsInTests.mjs for the shared max-lines cap, the same
 * way noMarginSpacing.mjs derives its prop set from styleProps.mjs.
 */

export const READ_FUNCTIONS = new Set([
  "readFileSync",
  "readFile",
  "existsSync",
  "createReadStream",
  "readdirSync",
]);

const SOURCE_EXTENSION = /\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;
const SOURCE_TEMPLATE_TAIL = /\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

export function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.property.name;
  }
}

/** All statically known string fragments inside an expression. */
export function stringFragments(node, variables, depth = 0) {
  if (!node || depth > 6) return [];
  switch (node.type) {
    case "Literal": {
      return typeof node.value === "string" ? [node.value] : [];
    }
    case "TemplateLiteral": {
      return node.quasis.map((quasi) => quasi.value.cooked ?? "").filter(Boolean);
    }
    case "BinaryExpression": {
      return [
        ...stringFragments(node.left, variables, depth + 1),
        ...stringFragments(node.right, variables, depth + 1),
      ];
    }
    case "CallExpression": {
      return node.arguments.flatMap((arg) => stringFragments(arg, variables, depth + 1));
    }
    case "Identifier": {
      const init = variables.get(node.name);
      return init ? stringFragments(init, variables, depth + 1) : [];
    }
    case "MemberExpression": {
      return stringFragments(node.object, variables, depth + 1);
    }
    case "ArrayExpression": {
      return node.elements.flatMap((el) => stringFragments(el, variables, depth + 1));
    }
    case "ObjectExpression": {
      return node.properties.flatMap((prop) =>
        stringFragments(prop.type === "Property" ? prop.value : prop, variables, depth + 1),
      );
    }
    case "SpreadElement": {
      return stringFragments(node.argument, variables, depth + 1);
    }
    default: {
      return [];
    }
  }
}

/** Whether an expression is (or is built from) a readdirSync result. */
export function derivesFromReaddir(node, variables, enumeratorHelpers, depth = 0) {
  if (!node || depth > 6) return false;
  if (node.type === "CallExpression") {
    if (calleeName(node.callee) === "readdirSync") return true;
    if (node.callee.type === "Identifier" && enumeratorHelpers.has(node.callee.name)) return true;
    return node.arguments.some((arg) => derivesFromReaddir(arg, variables, enumeratorHelpers, depth + 1));
  }
  if (node.type === "Identifier") {
    const init = variables.get(node.name);
    return init ? derivesFromReaddir(init, variables, enumeratorHelpers, depth + 1) : false;
  }
  if (node.type === "MemberExpression") {
    return derivesFromReaddir(node.object, variables, enumeratorHelpers, depth + 1);
  }
  return false;
}

export function isLegitTarget(fragments) {
  return fragments.some(
    (fragment) =>
      fragment.endsWith(".d.ts") ||
      fragment === "dist" ||
      fragment.includes("/dist/") ||
      fragment.startsWith("dist/"),
  );
}

export function isSourceTarget(fragments) {
  return fragments.some(
    (fragment) => SOURCE_EXTENSION.test(fragment) || SOURCE_TEMPLATE_TAIL.test(fragment.trim()),
  );
}

export function sourceFragmentOf(fragments) {
  return fragments.find((fragment) => SOURCE_EXTENSION.test(fragment));
}

export function isSourceDirectory(fragments) {
  return fragments.some(
    (fragment) => fragment === "src" || fragment.endsWith("/src") || fragment.startsWith("src/"),
  );
}

/** Every identifier name appearing anywhere under a node. */
export function identifiersIn(node, out = new Set(), depth = 0) {
  if (!node || typeof node !== "object" || depth > 8) return out;
  if (node.type === "Identifier") out.add(node.name);
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const child of value) identifiersIn(child, out, depth + 1);
    } else if (value && typeof value === "object" && value.type) {
      identifiersIn(value, out, depth + 1);
    }
  }
  return out;
}
