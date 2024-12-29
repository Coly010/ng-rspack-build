import { PluginAngularOptions } from './plugin-options';
import { join } from 'path';

export function normalizeOptions(
  options: Partial<PluginAngularOptions>
): PluginAngularOptions {
  return {
    root: options.root ?? process.cwd(),
    index: options.index ?? './src/index.html',
    browser: options.browser ?? './src/main.ts',
    server: options.server ?? './src/main.server.ts',
    ssrEntry: options.ssrEntry ?? './src/server.ts',
    polyfills: options.polyfills ?? ['zone.js'],
    assets: options.assets ?? ['./public'],
    styles: options.styles ?? ['./src/styles.css'],
    scripts: options.scripts ?? [],
    jit: options.jit ?? false,
    inlineStylesExtension: options.inlineStylesExtension ?? 'css',
    tsconfigPath:
      options.tsconfigPath ?? join(process.cwd(), 'tsconfig.app.json'),
  };
}
