import { Compiler, RspackPluginInstance } from '@rspack/core';
import { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';
import { FileReferenceTracker } from '@angular/build/src/tools/esbuild/angular/file-reference-tracker';
import { ParallelCompilation } from '@angular/build/src/tools/angular/compilation/parallel-compilation';
import { type AngularHostOptions } from '@angular/build/src/tools/angular/angular-host';
import { maxWorkers } from '../../utils/utils';
import { compile as sassCompile } from 'sass';
import { normalize } from 'path';
import * as compilerCli from '@angular/compiler-cli';
import {
  NG_RSPACK_SYMBOL_NAME,
  NgRspackBuildEnhancedCompilation,
} from '../types';

export class AngularRspackPlugin implements RspackPluginInstance {
  javascriptTransformer: JavaScriptTransformer;
  angularCompilation: ParallelCompilation;
  // @TODO remove or comment
  // stylesheetBundler: ComponentStylesheetBundler;
  referencedFileTracker: FileReferenceTracker;
  typeScriptFileCache: Map<string, string | Uint8Array>;
  tsconfig: string;
  isProd = process.env['NODE_ENV'] === 'production';
  compilerOptions: compilerCli.CompilerOptions;
  rootNames: string[];

  constructor(options: { tsconfig: string }) {
    this.javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: false,
      },
      maxWorkers
    );
    this.angularCompilation = new ParallelCompilation(false);
    this.referencedFileTracker = new FileReferenceTracker();
    this.typeScriptFileCache = new Map<string, string | Uint8Array>();
    this.tsconfig = options.tsconfig;
    const { options: tsCompilerOptions, rootNames } =
      compilerCli.readConfiguration(this.tsconfig, {
        suppressOutputPathCheck: true,
        outDir: undefined,
        sourceMap: false,
        inlineSourceMap: !this.isProd,
        inlineSources: !this.isProd,
        declaration: false,
        declarationMap: false,
        allowEmptyCodegenFiles: false,
        annotationsAs: 'decorators',
        enableResourceInlining: false,
        noEmitOnError: false,
        mapRoot: undefined,
        sourceRoot: undefined,
        supportTestBed: false,
        supportJitMode: false,
      });

    this.compilerOptions = tsCompilerOptions;
    this.rootNames = rootNames;
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tapAsync(
      'AngularRspackPlugin',
      async (params, callback) => {
        const watchingModifiedFiles = compiler.watching?.compiler?.modifiedFiles
          ? new Set(compiler.watching.compiler.modifiedFiles)
          : new Set<string>(this.rootNames);
        const modifiedFiles = this.referencedFileTracker.update(
          watchingModifiedFiles
        );
        // stylesheetBundler.invalidate(modifiedFiles);
        await this.angularCompilation.update(modifiedFiles);

        const hostOptions: AngularHostOptions = {
          modifiedFiles,
          async transformStylesheet(data, containingFile, stylesheetFile) {
            if (!stylesheetFile) {
              return '';
            }
            try {
              const result = sassCompile(stylesheetFile);
              return result.css;
            } catch (e) {
              console.error(
                `Failed to compile stylesheet ${stylesheetFile}`,
                e
              );
              return '';
            }
          },
          processWebWorker(workerFile) {
            return workerFile;
          },
        };

        try {
          await this.angularCompilation.initialize(
            this.tsconfig,
            hostOptions,
            () => this.compilerOptions
          );
        } catch (e) {
          console.error('Failed to initialize Angular Compilation', e);
        }

        try {
          for (const {
            filename,
            contents,
          } of await this.angularCompilation.emitAffectedFiles()) {
            const normalizedFilename = normalize(
              filename.replace(/^[A-Z]:/, '')
            );
            this.typeScriptFileCache.set(normalizedFilename, contents);
          }
          if (compiler.options.devServer?.hot) {
            compiler.hooks.afterEmit.tapAsync(
              'AngularRspackPlugin',
              (compilation, callback) => {
                for (const filename of compiler.watching?.compiler
                  ?.modifiedFiles ?? []) {
                  const contents = this.typeScriptFileCache.get(filename);
                  if (contents) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    compilation.assets[filename] = {
                      source: () =>
                        typeof contents === 'string'
                          ? contents
                          : Buffer.from(contents).toString('utf8'),
                      size: () =>
                        typeof contents === 'string'
                          ? contents.length
                          : Buffer.from(contents).toString('utf8').length,
                    };
                  }
                }
                callback();
              }
            );
          }
        } catch (e) {
          console.log('Failed to emit files from Angular Compilation', e);
        }
        callback();
      }
    );

    compiler.hooks.compilation.tap('AngularRspackPlugin', (compilation) => {
      (compilation as NgRspackBuildEnhancedCompilation)[NG_RSPACK_SYMBOL_NAME] =
        {
          javascriptTransformer: this.javascriptTransformer,
          typescriptFileCache: this.typeScriptFileCache,
        };
    });
  }
}
