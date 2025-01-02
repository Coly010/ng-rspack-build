import type { RsbuildPlugin } from '@rsbuild/core';
import {
  setupCompilation,
  setupCompilationWithParallelCompiltation,
} from './compilation/setup-compilation';
import { augmentHostWithCaching } from './compilation/augments';
import {
  buildAndAnalyze,
  buildAndAnalyzeWithParallelCompilation,
} from './compilation/build-and-analyze';
import { PluginAngularOptions } from '../models/plugin-options';
import { normalizeOptions } from '../models/normalize-options';
import { NgtscProgram } from '@angular/compiler-cli';
import * as ts from 'typescript';
import { SourceFileCache } from './utils/devkit';
import { FileEmitter } from './models';
import { JS_EXT_REGEX } from './utils/regex-filters';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import { maxWorkers } from '../utils/utils';

export const pluginCacheProvider = (
  options: PluginAngularOptions
): RsbuildPlugin => ({
  name: 'plugin-cache-provider',
  post: ['plugin-angular'],
  setup(api) {
    const pluginOptions = normalizeOptions(options);
    const config = api.getRsbuildConfig();
    let nextProgram: NgtscProgram | undefined | ts.Program;
    let builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    const sourceFileCache = new SourceFileCache();
    const typescriptFileCache = new Map<string, string | Uint8Array>();
    let watchMode = false;
    let fileEmitter: FileEmitter;
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: false,
      },
      maxWorkers
    );
    api.onBeforeStartDevServer(() => {
      watchMode = true;
    });

    api.onBeforeEnvironmentCompile(async () => {
      if (!pluginOptions.useExperimentalParallelCompilation) {
        const { rootNames, compilerOptions, host } = setupCompilation(
          config,
          pluginOptions
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
          await setupCompilationWithParallelCompiltation(config, pluginOptions);
        await buildAndAnalyzeWithParallelCompilation(
          parallelCompilation,
          typescriptFileCache,
          javascriptTransformer
        );
      }
    });

    api.transform({ test: JS_EXT_REGEX }, ({ code, resource }) => {
      if (!code.includes('@angular')) {
        return code;
      }
      const existingTransform = typescriptFileCache.get(resource);
      if (existingTransform) {
        return Buffer.from(existingTransform).toString();
      }
      return javascriptTransformer
        .transformData(resource, code, false, false)
        .then((contents: Uint8Array) => {
          const code = Buffer.from(contents).toString('utf8');
          typescriptFileCache.set(resource, code);
          return code;
        });
    });

    api.expose('plugin-cache-provider', {
      typescriptFileCache,
      getFileEmitter: () => fileEmitter,
    });
  },
});
