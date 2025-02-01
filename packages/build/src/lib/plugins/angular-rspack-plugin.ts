import {
  Compiler,
  RspackPluginInstance,
  RspackOptionsNormalized,
} from '@rspack/core';
import {
  AngularRspackPluginOptions,
  normalizeOptions,
  NG_RSPACK_SYMBOL_NAME,
  NgRspackCompilation,
} from '../models';
import { maxWorkers } from '../utils/utils';
import {
  setupCompilationWithParallelCompilation,
  buildAndAnalyzeWithParallelCompilation,
  JavaScriptTransformer,
} from '@ng-rspack/compiler';
import { dirname, normalize, resolve } from 'path';

const PLUGIN_NAME = 'AngularRspackPlugin';
type Awaited<T> = T extends Promise<infer U> ? U : T;
type ResolvedJavascriptTransformer = Parameters<
  typeof buildAndAnalyzeWithParallelCompilation
>[2];

export class AngularRspackPlugin implements RspackPluginInstance {
  #_options: AngularRspackPluginOptions;
  #typescriptFileCache: Map<string, string>;
  #javascriptTransformer: ResolvedJavascriptTransformer;
  // This will be defined in the apply method correctly
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  #angularCompilation: Awaited<
    ReturnType<typeof setupCompilationWithParallelCompilation>
  >;

  constructor(options: AngularRspackPluginOptions) {
    this.#_options = options;
    this.#typescriptFileCache = new Map<string, string>();
    this.#javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: true,
        jit: this.#_options.jit,
      },
      maxWorkers
    ) as unknown as ResolvedJavascriptTransformer;
  }

  apply(compiler: Compiler) {
    // Both of these are exclusive to each other - only one of them can be used at a time
    // But they will happen before the compiler is created - so we can use them to set up the parallel compilation once
    compiler.hooks.beforeRun.tapAsync(
      PLUGIN_NAME,
      async (compiler, callback) => {
        await this.setupCompilation(compiler.options.resolve.tsConfig);

        compiler.hooks.beforeCompile.tapAsync(
          PLUGIN_NAME,
          async (params, callback) => {
            await buildAndAnalyzeWithParallelCompilation(
              this.#angularCompilation,
              this.#typescriptFileCache,
              this.#javascriptTransformer
            );
            callback();
          }
        );

        callback();
      }
    );

    compiler.hooks.watchRun.tapAsync(
      PLUGIN_NAME,
      async (compiler, callback) => {
        if (
          !compiler.hooks.beforeCompile.taps.some(
            (tap) => tap.name === PLUGIN_NAME
          )
        ) {
          compiler.hooks.beforeCompile.tapAsync(
            PLUGIN_NAME,
            async (params, callback) => {
              const watchingModifiedFiles = compiler.watching?.compiler
                ?.modifiedFiles
                ? new Set(compiler.watching.compiler.modifiedFiles)
                : new Set<string>();
              await this.setupCompilation(compiler.options.resolve.tsConfig);
              await this.#angularCompilation.update(watchingModifiedFiles);

              await buildAndAnalyzeWithParallelCompilation(
                this.#angularCompilation,
                this.#typescriptFileCache,
                this.#javascriptTransformer
              );
              compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
                watchingModifiedFiles.forEach((file) => {
                  compilation.fileDependencies.add(file);
                });
              });

              callback();
            }
          );
        }

        callback();
      }
    );

    compiler.hooks.normalModuleFactory.tap(
      PLUGIN_NAME,
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tap(PLUGIN_NAME, (data) => {
          if (data.request.startsWith('angular:jit:')) {
            const path = data.request.split(';')[1];
            data.request = `${normalize(
              resolve(dirname(data.contextInfo.issuer), path)
            )}?raw`;
          }
        });
      }
    );

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      (compilation as NgRspackCompilation)[NG_RSPACK_SYMBOL_NAME] = () => ({
        javascriptTransformer: this
          .#javascriptTransformer as unknown as JavaScriptTransformer,
        typescriptFileCache: this.#typescriptFileCache,
      });
    });

    compiler.hooks.afterDone.tap(PLUGIN_NAME, () => {
      this.#angularCompilation.close();
    });
  }

  private async setupCompilation(
    tsConfig: RspackOptionsNormalized['resolve']['tsConfig']
  ) {
    const tsconfigPath = tsConfig
      ? typeof tsConfig === 'string'
        ? tsConfig
        : tsConfig.configFile
      : this.#_options.tsconfigPath;
    this.#angularCompilation = await setupCompilationWithParallelCompilation(
      {
        source: {
          tsconfigPath: tsconfigPath,
        },
      },
      {
        jit: this.#_options.jit,
        tsconfigPath: tsconfigPath,
        inlineStylesExtension: this.#_options.inlineStylesExtension,
        fileReplacements: this.#_options.fileReplacements,
      }
    );
  }
}
