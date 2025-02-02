import { FileReplacement } from '@ng-rspack/compiler';
import { PluginAngularOptions } from './plugin-options';
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
}: Pick<PluginAngularOptions, 'server' | 'ssrEntry' | 'root'>): boolean {
  return !!(
    server &&
    ssrEntry &&
    existsSync(join(root, server)) &&
    existsSync(join(root, ssrEntry))
  );
}

export const DEFAULT_PLUGIN_ANGULAR_OPTIONS: PluginAngularOptions = {
  root: process.cwd(),
  index: './src/index.html',
  browser: './src/main.ts',
  server: undefined,
  ssrEntry: undefined,
  fileReplacements: [],
  hasServer: false,
  polyfills: [],
  assets: ['./public'],
  styles: ['./src/styles.css'],
  scripts: [],
  jit: false,
  inlineStylesExtension: 'css',
  tsconfigPath: join(process.cwd(), 'tsconfig.app.json'),
  useTsProjectReferences: false,
  skipTypeChecking: false,
};

export function normalizeOptions(
  options: Partial<PluginAngularOptions> = {}
): PluginAngularOptions {
  const {
    root = DEFAULT_PLUGIN_ANGULAR_OPTIONS.root,
    fileReplacements = [],
    server,
    ssrEntry,
    ...restOptions
  } = options;

  return {
    ...DEFAULT_PLUGIN_ANGULAR_OPTIONS,
    ...restOptions,
    ...(root != null ? { root } : {}),
    ...(server != null ? { server } : {}),
    ...(ssrEntry != null ? { ssrEntry } : {}),
    fileReplacements: resolveFileReplacements(fileReplacements, root),
    hasServer: getHasServer({ server, ssrEntry, root }),
  };
}
