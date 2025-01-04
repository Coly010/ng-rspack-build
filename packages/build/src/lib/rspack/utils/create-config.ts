import { NgRspackPlugin, NgRspackPluginOptions } from '../plugins/ng-rspack';
import {
  Configuration,
  DevServer,
  SwcJsMinimizerRspackPlugin,
} from '@rspack/core';
import { join, resolve } from 'path';

export function createConfig(
  options: NgRspackPluginOptions,
  isServer = false
): Configuration {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const isDevServer = process.env['WEBPACK_SERVE'] && !isProduction;
  return {
    context: options.root,
    target: isServer ? 'node' : 'web',
    mode: isProduction ? 'production' : 'development',
    entry: {
      [isServer ? 'server' : 'main']: {
        import: [options.main],
      },
    },
    ...(isServer
      ? undefined
      : {
          devServer: {
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            allowedHosts: 'auto',
            client: {
              overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
              },
              reconnect: true,
            },
            historyApiFallback: {
              disableDotRule: true,
            },
            hot: true,
            port: options.port ?? 4200,
            onListening: (devServer) => {
              if (!devServer) {
                throw new Error('@rspack/dev-server is not defined');
              }

              const port =
                (devServer.server?.address() as { port: number })?.port ?? 4200;
              console.log('Listening on port:', port);
            },
          } as DevServer,
        }),
    output: {
      uniqueName: options.name,
      hashFunction: isProduction && !isServer ? 'xxhash64' : undefined,
      publicPath: 'auto',
      clean: true,
      path: join(options.root, options.outputPath),
      cssFilename:
        isProduction && !isServer ? '[name].[contenthash].css' : '[name].css',
      filename:
        isProduction && !isServer ? '[name].[contenthash].js' : '[name].js',
      chunkFilename:
        isProduction && !isServer ? '[name].[contenthash].js' : '[name].js',
      crossOriginLoading: false,
      trustedTypes: { policyName: 'angular#bundler' },
      ...(isServer ? undefined : { scriptType: 'module', module: true }),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js'],
      modules: ['node_modules'],
      mainFields: ['es2020', 'es2015', 'browser', 'module', 'main'],
      conditionNames: ['es2020', 'es2015', '...'],
      tsConfig: {
        configFile: resolve(options.root, options.tsConfig),
      },
    },
    optimization: isProduction
      ? {
          minimize: true,
          runtimeChunk: isServer ? false : 'single',
          splitChunks: {
            chunks: isServer ? 'async' : 'all',
            minChunks: 1,
            minSize: 20000,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            cacheGroups: {
              defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          },
          minimizer: [new SwcJsMinimizerRspackPlugin()],
        }
      : {
          minimize: false,
          minimizer: [],
        },
    experiments: {
      css: true,
    },
    module: {
      parser: {
        javascript: {
          requireContext: false,
          url: false,
        },
        'css/auto': {
          esModule: true,
        },
      },
      rules: [
        ...(!isServer && isDevServer
          ? [
              {
                loader: require.resolve(
                  '@ng-rspack/build/rspack/loaders/hmr/hmr-loader'
                ),
                include: [join(options.root, options.main)],
              },
            ]
          : []),
        {
          test: /\.?(sa|sc|c)ss$/,
          use: [
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                implementation: require.resolve('sass-embedded'),
              },
            },
          ],
          type: 'css/auto',
        },
        { test: /[/\\]rxjs[/\\]add[/\\].+\.js$/, sideEffects: true },
        {
          test: /\.[cm]?[jt]sx?$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                  },
                },
              },
            },
            {
              loader: require.resolve(
                '@ng-rspack/build/rspack/loaders/angular-loader'
              ),
            },
          ],
        },
        {
          test: /\.[cm]?js$/,
          use: [
            {
              loader: require.resolve(
                '@ng-rspack/build/rspack/loaders/js-loader'
              ),
            },
          ],
        },
      ],
    },
    plugins: [new NgRspackPlugin(options)],
  };
}
