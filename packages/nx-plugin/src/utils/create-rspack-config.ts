import { ExecutorContext, joinPathFragments, workspaceRoot } from '@nx/devkit';
import { Configuration } from '@rspack/core';
import { createConfig } from '@ng-rspack/build';
import { BuildExecutorSchema } from '../executors/build/schema';

export function createRspackConfig(
  options: BuildExecutorSchema & { port?: number },
  context: ExecutorContext
): Configuration {
  const { root, name } = context.projectGraph.nodes[context.projectName].data;

  process.env['NODE_ENV'] = options.mode;

  return createConfig({
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
}
