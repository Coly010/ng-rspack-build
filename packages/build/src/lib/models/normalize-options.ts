import { FileReplacement } from '@ng-rspack/compiler';
import { AngularRspackPluginOptions } from './angular-rspack-plugin-options';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

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

export function getHasServer({
  server,
  ssrEntry,
  root,
}: Pick<AngularRspackPluginOptions, 'server' | 'ssrEntry' | 'root'>): boolean {
  return !!(
    server &&
    ssrEntry &&
    existsSync(join(root, server)) &&
    existsSync(join(root, ssrEntry))
  );
}

export function normalizeOptions(
  options: Partial<AngularRspackPluginOptions> = {}
): AngularRspackPluginOptions {
  const {
    root = process.cwd(),
    fileReplacements = [],
    server,
    ssrEntry,
  } = options;

  return {
    root,
    index: options.index ?? './src/index.html',
    browser: options.browser ?? './src/main.ts',
    ...(server ? { server } : {}),
    ...(ssrEntry ? { ssrEntry } : {}),
    polyfills: options.polyfills ?? [],
    assets: options.assets ?? ['./public'],
    styles: options.styles ?? ['./src/styles.css'],
    scripts: options.scripts ?? [],
    fileReplacements: resolveFileReplacements(fileReplacements, root),
    jit: options.jit ?? false,
    inlineStylesExtension: options.inlineStylesExtension ?? 'css',
    tsconfigPath:
      options.tsconfigPath ?? join(process.cwd(), 'tsconfig.app.json'),
    hasServer: getHasServer({ server, ssrEntry, root }),
    useTsProjectReferences: options.useTsProjectReferences ?? false,
  };
}
