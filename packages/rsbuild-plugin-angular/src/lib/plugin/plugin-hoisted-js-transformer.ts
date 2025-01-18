import type { RsbuildPlugin } from '@rsbuild/core';
import { NgtscProgram } from '@angular/compiler-cli';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import * as ts from 'typescript';
import {
  FileEmitter,
  SourceFileCache,
  augmentHostWithCaching,
  buildAndAnalyze,
  buildAndAnalyzeWithParallelCompilation,
  setupCompilation,
  setupCompilationWithParallelCompilation,
  JS_ALL_EXT_REGEX,
} from '@ng-rspack/compiler';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { maxWorkers } from '../utils/utils';

export const pluginHoistedJsTransformer = (
  options: PluginAngularOptions
): RsbuildPlugin => ({
  name: 'plugin-hoisted-js-transformer',
  post: ['plugin-angular'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    const config = api.getRsbuildConfig();
    const sourceFileCache = new SourceFileCache();
    const typescriptFileCache = new Map<string, string | Uint8Array>();
    let nextProgram: NgtscProgram | undefined | ts.Program;
    let builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    let watchMode = false;
    let fileEmitter: FileEmitter;
    let isServer = pluginOptions.hasServer;
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: pluginOptions.jit,
      },
      maxWorkers
    );
    api.onBeforeStartDevServer(() => {
      watchMode = true;
    });

    api.modifyRspackConfig((config, { environment }) => {
      isServer = isServer && environment.name === 'server';
      return config;
    });

    api.onBeforeEnvironmentCompile(async () => {
      if (!pluginOptions.useParallelCompilation) {
        const { rootNames, compilerOptions, host } = setupCompilation(
          config,
          pluginOptions,
          isServer,
          true
        );
        // Only store cache if in watch mode
        if (watchMode) {
          augmentHostWithCaching(host, sourceFileCache);
        }

        fileEmitter = await buildAndAnalyze(
          rootNames,
          host,
          compilerOptions,
          nextProgram,
          builderProgram,
          { watchMode, jit: pluginOptions.jit }
        );
      } else {
        const parallelCompilation =
          await setupCompilationWithParallelCompilation(config, pluginOptions);
        await buildAndAnalyzeWithParallelCompilation(
          parallelCompilation,
          typescriptFileCache,
          javascriptTransformer
        );
      }
    });

    api.transform({ test: JS_ALL_EXT_REGEX }, ({ code, resource }) => {
      if (!code.includes('@angular')) {
        return code;
      }
      const existingTransform = typescriptFileCache.get(resource);
      if (existingTransform) {
        if (typeof existingTransform === 'string') {
          return existingTransform;
        } else {
          return Buffer.from(existingTransform).toString();
        }
      }
      return javascriptTransformer
        .transformData(resource, code, false, false)
        .then((contents: Uint8Array) => {
          const transformedCode = Buffer.from(contents).toString('utf8');
          typescriptFileCache.set(resource, transformedCode);
          return transformedCode;
        });
    });

    api.expose('plugin-hoisted-js-transformer', {
      typescriptFileCache,
      getFileEmitter: () => fileEmitter,
    });
  },
});
