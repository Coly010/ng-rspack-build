import { defineConfig } from '@rsbuild/core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { pluginAngular } from '../plugin/plugin-angular';

export function createConfig(pluginOptions: Partial<PluginAngularOptions>) {
  const normalizedOptions = normalizeOptions(pluginOptions);

  const hasServer = Boolean(
    normalizedOptions.server &&
      existsSync(resolve(normalizedOptions.root, normalizedOptions.server))
  );

  return defineConfig({
    root: normalizedOptions.root,
    source: {
      tsconfigPath: normalizedOptions.tsconfigPath,
    },
    plugins: [pluginAngular(normalizedOptions)],
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    environments: {
      browser: {
        source: {
          preEntry: [
            ...normalizedOptions.polyfills,
            ...normalizedOptions.styles,
          ],
          entry: {
            index: normalizedOptions.browser,
          },
          assetsInclude: normalizedOptions.assets,
        },
        output: {
          target: 'web',
          distPath: {
            root: 'dist/browser',
          },
        },
        html: {
          template: normalizedOptions.index,
        },
      },
      ...(hasServer
        ? {
            server: {
              source: {
                preEntry: [...normalizedOptions.polyfills],
                entry: {
                  server: normalizedOptions.ssrEntry,
                },
              },
              output: {
                target: 'node',
                distPath: { root: 'dist/server' },
              },
            },
          }
        : {}),
    },
  });
}
