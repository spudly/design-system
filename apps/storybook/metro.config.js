const fs = require("node:fs");
const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "../..");
const srcRoot = path.join(repoRoot, "src");

const config = getDefaultConfig(projectRoot);

// The stories and components under test live in the repo's src/,
// outside this app folder: watch the repo root so Metro can bundle
// them.
config.watchFolders = [repoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

const storybookConfig = withStorybook(config, {
  configPath: path.resolve(projectRoot, "./.rnstorybook"),
});

// Two resolution hazards, both handled by the chained resolver below:
//
// 1. DS sources are authored as ESM with explicit ".js" specifiers
//    naming ".ts"/".tsx" files (Node-style resolution, which the
//    package build and web Storybook handle natively). Metro does not
//    map those, so a relative ".js" request is rewritten to its
//    source file when one exists.
//
// 2. The repo root has its own node_modules (web Storybook / package
//    build). Files under src/ would, by Metro's upward walk, resolve
//    react/tamagui from THAT tree while app files resolve them from
//    this app's tree — two Reacts in one bundle breaks hooks and
//    Tamagui context. So bare imports originating in src/ are
//    resolved as if they originated in this app, binding the whole
//    graph to the app's single tree (whose versions are pinned to
//    the library's lockfile: react, tamagui, @tamagui/*).
const appOriginModule = path.join(projectRoot, "Storybook.tsx");
const innerResolveRequest = storybookConfig.resolver.resolveRequest;
storybookConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = innerResolveRequest ?? context.resolveRequest;
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    const base = path.resolve(
      path.dirname(context.originModulePath),
      moduleName.slice(0, -".js".length),
    );
    for (const ext of [".ts", ".tsx"]) {
      if (fs.existsSync(base + ext)) {
        return { type: "sourceFile", filePath: base + ext };
      }
    }
  }
  if (!moduleName.startsWith(".") && context.originModulePath.startsWith(srcRoot + path.sep)) {
    return resolve({ ...context, originModulePath: appOriginModule }, moduleName, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = storybookConfig;
