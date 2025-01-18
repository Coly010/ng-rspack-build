import { FileReplacement } from '@ng-rspack/compiler';
import { resolve } from 'path';
import { join } from 'node:path';
import { AngularRspackPluginOptions } from './angular-rspack-plugin-options';

/**
 * Resolves file replacement paths to absolute paths based on the provided root directory.
 *
 * @param fileReplacements - Array of file replacements with relative paths.
 * @param root - The root directory to resolve the paths against.
 * @returns Array of file replacements resolved against the root.
 */
export function resolveFileReplacements(
  fileReplacements: FileReplacement[],
  root: string
): FileReplacement[] {
  return fileReplacements.map((fileReplacement) => ({
    replace: resolve(root, fileReplacement.replace),
    with: resolve(root, fileReplacement.with),
  }));
}

export function normalizeOptions(
  options: Partial<AngularRspackPluginOptions> = {}
): AngularRspackPluginOptions {
  const { root = process.cwd(), fileReplacements = [] } = options;

  return {
    root,
    index: options.index ?? './src/index.html',
    main: options.main ?? './src/main.ts',
    polyfills: options.polyfills ?? [],
    assets: options.assets ?? ['./public'],
    styles: options.styles ?? ['./src/styles.css'],
    scripts: options.scripts ?? [],
    fileReplacements: resolveFileReplacements(fileReplacements, root),
    jit: options.jit ?? false,
    inlineStylesExtension: options.inlineStylesExtension ?? 'css',
    tsconfigPath:
      options.tsconfigPath ?? join(process.cwd(), 'tsconfig.app.json'),
  };
}
