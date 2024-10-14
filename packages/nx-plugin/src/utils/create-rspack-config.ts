import { ExecutorContext, joinPathFragments, workspaceRoot } from '@nx/devkit';
import { registerTsProject } from '@nx/js/src/internal';
import { clearRequireCache } from '@nx/devkit/src/utils/config-utils';
import { Configuration } from '@rspack/core';
import { createConfig } from '@ng-rspack/build';
import { join } from 'path';
import { merge as rspackMerge } from 'webpack-merge';
import { BuildExecutorSchema } from '../executors/build/schema';

export async function createRspackConfig(
  options: BuildExecutorSchema & { port?: number },
  context: ExecutorContext
): Promise<Configuration> {
  const { root, name } = context.projectGraph.nodes[context.projectName].data;

  process.env['NODE_ENV'] = options.mode;

  const createdConfig = createConfig({
    root: joinPathFragments(workspaceRoot, root),
    name,
    main: options.main,
    index: options.index,
    tsConfig: options.tsConfig,
    outputPath: options.outputPath,
    polyfills: options.polyfills ?? [],
    assets: options.assets ?? [],
    styles: options.styles ?? [],
    scripts: options.scripts ?? [],
    port: options.port ?? 4200,
  });

  if (!options.customRspackConfig) {
    return createdConfig;
  }

  let userDefinedConfig: any = {};
  const pathToConfig = join(workspaceRoot, root, options.customRspackConfig);
  if (options.tsConfig) {
    userDefinedConfig = resolveUserDefinedRspackConfig(
      pathToConfig,
      options.tsConfig
    );
  } else {
    userDefinedConfig = await import(pathToConfig).then((x) => x.default || x);
  }

  return rspackMerge(createdConfig, userDefinedConfig);
}

function resolveUserDefinedRspackConfig(
  path: string,
  tsConfig: string,
  /** Skip require cache and return latest content */
  reload = false
) {
  if (reload) {
    // Clear cache if the path is in the cache
    if (require.cache[path]) {
      // Clear all entries because config may import other modules
      clearRequireCache();
    }
  }

  // Don't transpile non-TS files. This prevents workspaces libs from being registered via tsconfig-paths.
  // There's an issue here with Nx workspace where loading plugins from source (via tsconfig-paths) can lead to errors.
  if (!/\.(ts|mts|cts)$/.test(path)) {
    return require(path);
  }

  const cleanupTranspiler = registerTsProject(tsConfig);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maybeCustomRspackConfig = require(path);
  cleanupTranspiler();

  // If the user provides a configuration in TS file
  // then there are 3 cases for exporing an object. The first one is:
  // `module.exports = { ... }`. And the second one is:
  // `export default { ... }`. The ESM format is compiled into:
  // `{ default: { ... } }`
  // There is also a case of
  // `{ default: { default: { ... } }`
  const customRspackConfig =
    'default' in maybeCustomRspackConfig
      ? 'default' in maybeCustomRspackConfig.default
        ? maybeCustomRspackConfig.default.default
        : maybeCustomRspackConfig.default
      : maybeCustomRspackConfig;

  return customRspackConfig;
}
