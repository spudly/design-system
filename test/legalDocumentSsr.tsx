/**
 * Shared SSR harness for the LegalDocumentPage contract tests
 * (src/pages/LegalDocumentPage.test.tsx and
 * src/widgets/proseDocument.test.tsx).
 *
 * Both files render the same built page, so they share one lazy
 * runtime loader and one render helper here instead of carrying
 * identical copies (#587 phase 2 — jscpd burn-down). Runtime imports
 * stay lazy (inside the loader) so the calling files' source-scan
 * tests still run and report when the build output is missing or
 * broken, instead of failing at import time.
 */
import { loadInternalDist } from "./internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
export function loadLegalDocumentRuntime(): Promise<Record<string, any>> {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const voiceFixtures: Record<string, any> = await import("../dist/voice/fixtures.js");
    const voiceModule: Record<string, any> = await import("../dist/voice/index.js");
    const { LegalDocumentPage }: Record<string, any> =
      await import("../dist/pages/LegalDocumentPage.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ...voiceFixtures,
      ...voiceModule,
      LegalDocumentPage,
    };
  })();
  return runtimePromise;
}

export async function renderLegalDocumentToHtml(element: any): Promise<string> {
  const {
    renderToString,
    TamaguiProvider,
    createTamaguiConfig,
    baseTheme,
    VoiceProvider,
    fixtureVoice,
  } = await loadLegalDocumentRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      <VoiceProvider voice={fixtureVoice}>{element}</VoiceProvider>
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}
