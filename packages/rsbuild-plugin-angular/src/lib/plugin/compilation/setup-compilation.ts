import { RsbuildConfig } from '@rsbuild/core';
import * as compilerCli from '@angular/compiler-cli';
import * as ts from 'typescript';
import { compileString as sassCompileString } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { PluginAngularOptions } from '../../models/plugin-options';
import { ParallelCompilation } from '@angular/build/src/tools/angular/compilation/parallel-compilation';
import { transformFileSync } from '@swc/core';

export function setupCompilation(
  config: RsbuildConfig,
  options: PluginAngularOptions,
  isServer = false
) {
  const isProd = config.mode === 'production';

  const { options: tsCompilerOptions, rootNames } =
    compilerCli.readConfiguration(
      config.source?.tsconfigPath ?? options.tsconfigPath,
      {
        suppressOutputPathCheck: true,
        outDir: undefined,
        sourceMap: false,
        inlineSourceMap: !isProd,
        inlineSources: !isProd,
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
      }
    );

  const compilerOptions = tsCompilerOptions;
  const host = ts.createIncrementalCompilerHost(compilerOptions);

  const styleTransform = (code: string) => {
    const result = sassCompileString(code);
    return result.css;
  };

  if (!options.jit) {
    augmentHostWithResources(host, styleTransform, {
      inlineStylesExtension: options.inlineStylesExtension,
      isProd,
    });
  }

  const rn = rootNames.filter((n) =>
    isServer ? !n.endsWith('main.ts') : n.endsWith('main.ts')
  );

  return {
    rootNames: rn,
    compilerOptions,
    host,
  };
}

export async function setupCompilationWithParallelCompiltation(
  config: RsbuildConfig,
  options: PluginAngularOptions,
  isServer = false
) {
  const { rootNames, compilerOptions, host } = setupCompilation(
    config,
    options,
    isServer
  );
  const parallelCompilation = new ParallelCompilation(options.jit ?? false);

  try {
    await parallelCompilation.initialize(
      config.source?.tsconfigPath ?? options.tsconfigPath,
      {
        modifiedFiles: new Set(rootNames),
        async transformStylesheet(data, containingFile, stylesheetFile) {
          const result = sassCompileString(data);
          return result.css;
        },
        processWebWorker(workerFile: string, containingFile: string) {
          return transformFileSync(workerFile).code;
        },
      },
      (opts) => compilerOptions
    );
  } catch (e) {
    console.error('Failed to initialize Angular Compilation', e);
  }
  return parallelCompilation;
}
