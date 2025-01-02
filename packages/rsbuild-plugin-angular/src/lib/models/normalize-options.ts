import { PluginAngularOptions } from './plugin-options';
import { join } from 'path';
import { existsSync } from 'fs';

export function normalizeOptions(
  options: Partial<PluginAngularOptions>
): PluginAngularOptions {
  const normalizedOptions = {
    root: options.root ?? process.cwd(),
    index: options.index ?? './src/index.html',
    browser: options.browser ?? './src/main.ts',
    server: options.server ?? undefined,
    ssrEntry: options.ssrEntry ?? undefined,
    polyfills: options.polyfills ?? [],
    assets: options.assets ?? ['./public'],
    styles: options.styles ?? ['./src/styles.css'],
    scripts: options.scripts ?? [],
    jit: options.jit ?? false,
    inlineStylesExtension: options.inlineStylesExtension ?? 'css',
    tsconfigPath:
      options.tsconfigPath ?? join(process.cwd(), 'tsconfig.app.json'),
    hasServer: false,
    useHoistedJavascriptProcessing:
      options.useHoistedJavascriptProcessing ?? true,
    useParallelCompilation: options.useParallelCompilation ?? true,
  };
  if (
    options.server &&
    options.ssrEntry &&
    existsSync(join(normalizedOptions.root, options.server)) &&
    existsSync(join(normalizedOptions.root, options.ssrEntry))
  ) {
    normalizedOptions.hasServer = true;
  }
  return normalizedOptions;
}
