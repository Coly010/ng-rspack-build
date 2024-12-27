import { PluginAngularOptions } from '../models';
import { join } from 'path';

export function normalizeOptions(
  options: Partial<PluginAngularOptions>
): PluginAngularOptions {
  return {
    root: options.root ?? process.cwd(),
    jit: options.jit ?? false,
    inlineStylesExtension: options.inlineStylesExtension ?? 'css',
    tsconfigPath:
      options.tsconfigPath ?? join(process.cwd(), 'tsconfig.app.json'),
  };
}
