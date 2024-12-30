import { defineConfig } from '@rsbuild/core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { pluginAngular } from '../plugin/plugin-angular';

export function createConfig(pluginOptions: Partial<PluginAngularOptions>) {
  const normalizedOptions = normalizeOptions(pluginOptions);
  const browserPolyfills = [...normalizedOptions.polyfills, 'zone.js'];
  const serverPolyfills = [
    ...normalizedOptions.polyfills,
    'zone.js/node',
    '@angular/platform-server/init',
  ];

  const hasServer = Boolean(
    normalizedOptions.server &&
      existsSync(resolve(normalizedOptions.root, normalizedOptions.server))
  );

  const isProd = process.env.NODE_ENV === 'production';

  return defineConfig({
    root: normalizedOptions.root,
    source: {
      tsconfigPath: normalizedOptions.tsconfigPath,
    },
    plugins: [pluginAngular(normalizedOptions)],
    mode: isProd ? 'production' : 'development',
    environments: {
      browser: {
        source: {
          preEntry: [...browserPolyfills, ...normalizedOptions.styles],
          entry: {
            index: normalizedOptions.browser,
          },
          assetsInclude: normalizedOptions.assets,
          define: {
            ...(isProd ? { ngDevMode: 'false' } : undefined),
            ngJitMode: pluginOptions.jit,
          },
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
                preEntry: [...serverPolyfills],
                entry: {
                  server: normalizedOptions.ssrEntry,
                },
                define: {
                  ngServerMode: true,
                  ...(isProd ? { ngDevMode: 'false' } : undefined),
                  ngJitMode: pluginOptions.jit,
                },
              },
              output: {
                target: 'node',
                polyfill: 'entry',
                distPath: { root: 'dist/server' },
              },
            },
          }
        : {}),
    },
  });
}
