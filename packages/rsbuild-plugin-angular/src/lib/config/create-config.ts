import {
  defineConfig,
  type RsbuildConfig,
  mergeRsbuildConfig,
  RsbuildPlugin,
} from '@rsbuild/core';
import { dirname } from 'path';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { pluginAngular } from '../plugin/plugin-angular';
import { pluginHoistedJsTransformer } from '../plugin/plugin-hoisted-js-transformer';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginLess } from '@rsbuild/plugin-less';

export function createConfig(
  pluginOptions: Partial<PluginAngularOptions>,
  rsbuildConfigOverrides?: Partial<RsbuildConfig>
): RsbuildConfig {
  const normalizedOptions = normalizeOptions(pluginOptions);
  const browserPolyfills = [...normalizedOptions.polyfills, 'zone.js'];
  const serverPolyfills = [
    ...normalizedOptions.polyfills,
    'zone.js/node',
    '@angular/platform-server/init',
  ];

  const isRunningDevServer = process.argv.at(2) === 'dev';
  const isProd = process.env.NODE_ENV === 'production';

  const stylePlugins: RsbuildPlugin[] = [];

  if (
    normalizedOptions.inlineStylesExtension === 'scss' ||
    normalizedOptions.inlineStylesExtension === 'sass'
  ) {
    if (
      normalizedOptions.stylePreprocessorOptions?.includePaths ||
      normalizedOptions.stylePreprocessorOptions?.sass
    ) {
      stylePlugins.push(
        pluginSass({
          sassLoaderOptions: {
            sassOptions: {
              includePaths:
                normalizedOptions.stylePreprocessorOptions?.includePaths,
              ...(normalizedOptions.stylePreprocessorOptions?.sass ?? {}),
            },
          },
        })
      );
    } else {
      stylePlugins.push(pluginSass());
    }
  } else if (normalizedOptions.inlineStylesExtension === 'less') {
    if (normalizedOptions.stylePreprocessorOptions?.includePaths) {
      stylePlugins.push(
        pluginLess({
          lessLoaderOptions: {
            lessOptions: {
              javascriptEnabled: true,
              paths: normalizedOptions.stylePreprocessorOptions?.includePaths,
            },
          },
        })
      );
    } else {
      stylePlugins.push(
        pluginLess({
          lessLoaderOptions: {
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        })
      );
    }
  }

  const rsbuildPluginAngularConfig = defineConfig({
    root: normalizedOptions.root,
    source: {
      tsconfigPath: normalizedOptions.tsconfigPath,
    },
    plugins: [pluginHoistedJsTransformer(normalizedOptions), ...stylePlugins],
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
            ngJitMode: pluginOptions.jit, // @TODO: use normalizedOptions
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
                  ngJitMode: pluginOptions.jit, // @TODO: use normalizedOptions
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
  const configurationMode = process.env[configEnvVar] ?? 'production';
  const isDefault = configurationMode === 'default';
  const isModeConfigured = configurationMode in configurations;

  const mergedBuildOptionsOptions = {
    ...defaultOptions.options,
    ...((!isDefault && isModeConfigured
      ? configurations[configurationMode]?.options
      : {}) ?? {}),
  };

  let mergedRsbuildConfigOverrides =
    defaultOptions.rsbuildConfigOverrides ?? {};
  if (
    !isDefault &&
    isModeConfigured &&
    configurations[configurationMode]?.rsbuildConfigOverrides
  ) {
    mergedRsbuildConfigOverrides = mergeRsbuildConfig(
      mergedRsbuildConfigOverrides,
      configurations[configurationMode]?.rsbuildConfigOverrides ?? {}
    );
  }

  return createConfig(mergedBuildOptionsOptions, mergedRsbuildConfigOverrides);
}
