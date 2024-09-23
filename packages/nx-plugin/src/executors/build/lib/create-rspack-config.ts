import { BuildExecutorSchema } from '../schema';
import { createConfig } from '@ng-rspack/build';
import { ExecutorContext } from '@nx/devkit';
import { Configuration } from '@rspack/core';

export function createRspackConfig(
  options: BuildExecutorSchema,
  context: ExecutorContext
): Configuration {
  const { root, name } = context.projectGraph.nodes[context.projectName].data;

  process.env['NODE_ENV'] = options.mode;

  return createConfig({
    root,
    name,
    main: options.main,
    index: options.index,
    tsConfig: options.tsConfig,
    outputPath: options.outputPath,
    polyfills: options.polyfills ?? [],
    assets: options.assets ?? [],
    styles: options.styles ?? [],
    scripts: options.scripts ?? [],
  });
}
