import {
  defineConfig,
  type RsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import { dirname } from 'path';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { pluginAngular } from '../plugin/plugin-angular';

export function createConfig(
  pluginOptions: Partial<PluginAngularOptions>,
  additionalConfig?: Partial<RsbuildConfig>
) {
  const normalizedOptions = normalizeOptions(pluginOptions);
  const browserPolyfills = [...normalizedOptions.polyfills, 'zone.js'];
  const serverPolyfills = [
    ...normalizedOptions.polyfills,
    'zone.js/node',
    '@angular/platform-server/init',
  ];

  const isRunningDevServer = process.argv.splice(2)[0] === 'dev';
  const isProd = process.env.NODE_ENV === 'production';

  const rsbuildPluginAngularConfig = defineConfig({
    root: normalizedOptions.root,
    source: {
      tsconfigPath: normalizedOptions.tsconfigPath,
    },
    mode: isProd ? 'production' : 'development',
    dev: {
      ...(isRunningDevServer && normalizedOptions.hasServer
        ? {
            writeToDisk: (file) => !file.includes('.hot-update.'),
            client: {
              port: 4200,
              host: 'localhost',
            },
            hmr: false,
            liveReload: true,
          }
        : undefined),
    },
    server: {
      host: 'localhost',
      port: 4200,
      htmlFallback: false,
      historyApiFallback: {
        index: '/index.html',
        rewrites: [{ from: /^\/$/, to: 'index.html' }],
      },
    },
    environments: {
      browser: {
        plugins: [pluginAngular(normalizedOptions)],
        source: {
          preEntry: [...browserPolyfills, ...normalizedOptions.styles],
          entry: {
            index: normalizedOptions.browser,
          },
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
          copy: normalizedOptions.assets.map((srcPath) => ({
            from: srcPath,
            to: dirname(srcPath),
          })),
        },
        html: {
          template: normalizedOptions.index,
        },
      },
      ...(normalizedOptions.hasServer
        ? {
            server: {
              plugins: [pluginAngular(normalizedOptions)],
              source: {
                preEntry: [...serverPolyfills],
                entry: {
                  server: normalizedOptions.ssrEntry!,
                  bootstrap: normalizedOptions.server!,
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

  const userDefinedConfig = defineConfig(additionalConfig || {});
  return mergeRsbuildConfig(rsbuildPluginAngularConfig, userDefinedConfig);
}
