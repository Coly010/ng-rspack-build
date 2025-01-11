import {
  defineConfig,
  type RsbuildConfig,
  mergeRsbuildConfig,
} from '@rsbuild/core';
import { dirname } from 'path';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { pluginAngular } from '../plugin/plugin-angular';
import { pluginHoistedJsTransformer } from '../plugin/plugin-hoisted-js-transformer';

export function createConfig(
  pluginOptions: Partial<PluginAngularOptions>,
  rsbuildConfigOverrides?: Partial<RsbuildConfig>
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
    plugins: [pluginHoistedJsTransformer(normalizedOptions)],
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
    tools: {
      rspack(config) {
        config.resolve ??= {};
        config.resolve.extensionAlias = {};
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

  const userDefinedConfig = defineConfig(rsbuildConfigOverrides || {});
  return mergeRsbuildConfig(rsbuildPluginAngularConfig, userDefinedConfig);
}

export function withConfigurations(
  defaultOptions: {
    options: Partial<PluginAngularOptions>;
    rsbuildConfigOverrides?: Partial<RsbuildConfig>;
  },
  configurations: Record<
    string,
    {
      options: Partial<PluginAngularOptions>;
      rsbuildConfigOverrides?: Partial<RsbuildConfig>;
    }
  > = {},
  configEnvVar = 'NGRS_CONFIG'
) {
  const configuration = process.env[configEnvVar] ?? 'production';
  const mergedBuildOptionsOptions = {
    ...defaultOptions.options,
    ...((configuration !== 'default' && configuration in configurations
      ? configurations[configuration]?.options
      : {}) ?? {}),
  };

  let mergedRsbuildConfigOverrides =
    defaultOptions.rsbuildConfigOverrides ?? {};
  if (
    configuration !== 'default' &&
    configuration in configurations &&
    configurations[configuration]?.rsbuildConfigOverrides
  ) {
    mergedRsbuildConfigOverrides = mergeRsbuildConfig(
      mergedRsbuildConfigOverrides,
      configurations[configuration]?.rsbuildConfigOverrides ?? {}
    );
  }

  return createConfig(mergedBuildOptionsOptions, mergedRsbuildConfigOverrides);
}
