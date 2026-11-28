/**
 * Behavior tests for RouteErrorPage's recovery action (#765):
 * the optional host-supplied `action` ({ label, onPress }) —
 * label is host data, the press is a callback (a retry acts in
 * place, #248) rendered as a DS Button alongside the home link.
 * Without an action, rendering is unchanged (no Button).
 *
 * The tree test captures the page's element tree during an SSR
 * render under the VoiceProvider (the page reads its default
 * copy from the voice object), finds the Button element, and
 * invokes its onPress — the codebase's element-tree idiom for
 * proving a callback fires.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const React = (await import("react")).default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const voiceModule: Record<string, any> = await import("../../../dist/voice/index.js");
    const voiceFixtures: Record<string, any> = await import("../../../dist/voice/fixtures.js");
    const pageModule: Record<string, any> = await import("../../../dist/pages/eciperay/RouteErrorPage.js");
    const distWidgets: Record<string, any> = await import("../../../dist/widgets/index.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ...voiceModule,
      ...voiceFixtures,
      ...pageModule,
      distWidgets,
    };
  })();
  return runtimePromise;
}

async function renderRouteError(props: Record<string, any>) {
  const {
    React,
    renderToString,
    TamaguiProvider,
    createTamaguiConfig,
    baseTheme,
    VoiceProvider,
    fixtureVoice,
    RouteErrorPage,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(
        VoiceProvider,
        { voice: fixtureVoice },
        React.createElement(RouteErrorPage, { variant: "error", ...props }),
      ),
    ),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

function findElement(node: any, predicate: (el: any) => boolean): any {
  if (node === null || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, predicate);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if ("props" in node) {
    if (predicate(node)) return node;
    return findElement(node.props?.children, predicate);
  }
  return undefined;
}

test("action (#765): the Button forwards the host label + callback, and the callback fires", async () => {
  const {
    React,
    renderToString,
    TamaguiProvider,
    createTamaguiConfig,
    baseTheme,
    VoiceProvider,
    fixtureVoice,
    RouteErrorPage,
    distWidgets,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  let presses = 0;
  const onPress = () => {
    presses += 1;
  };
  let captured: any;
  function Capture() {
    captured = RouteErrorPage({
      variant: "error",
      action: { label: "Try again", onPress },
    });
    return captured;
  }
  renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(VoiceProvider, { voice: fixtureVoice }, React.createElement(Capture)),
    ),
  );
  const button = findElement(captured, (el: any) => el.type === distWidgets.Button);
  assert.ok(button, "an action renders a DS Button");
  assert.equal(button.props.children, "Try again", "the host-supplied label is forwarded");
  assert.equal(button.props.onPress, onPress, "the host callback is forwarded to the Button");
  button.props.onPress();
  assert.equal(presses, 1, "the action callback fires");
});

test("SSR: with an action, its label renders as a button beside the home link", async () => {
  const html = await renderRouteError({ action: { label: "Try again", onPress: () => {} } });
  assert.match(html, /Try again/, "the action label renders");
  assert.match(html, /<button/, "the action renders as a button element (callback form)");
  assert.match(html, /href="\//, "the home link still renders");
});

test("SSR: without an action, no action button renders — rendering is unchanged", async () => {
  const html = await renderRouteError({});
  assert.doesNotMatch(html, /Try again/, "no action label renders");
  assert.doesNotMatch(html, /<button/, "no button renders without an action");
  assert.match(html, /href="\//, "the home link still renders");
});
