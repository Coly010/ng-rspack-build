import { RsbuildConfig } from '@rsbuild/core';
import { readConfiguration } from '@angular/compiler-cli';
import * as ts from 'typescript';
import { compileString as sassCompileString } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { PluginAngularOptions } from '../../models/plugin-options';
import { ParallelCompilation } from '@angular/build/src/tools/angular/compilation/parallel-compilation';
import { transformFileSync } from '@swc/core';

export const DEFAULT_NG_COMPILER_OPTIONS: ts.CompilerOptions = {
  suppressOutputPathCheck: true,
  outDir: undefined,
  sourceMap: false,
  inlineSourceMap: true,
  inlineSources: true,
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
};

export function setupCompilation(
  config: Pick<RsbuildConfig, 'mode' | 'source'>,
  options: Pick<
    PluginAngularOptions,
    'tsconfigPath' | 'jit' | 'inlineStylesExtension'
  >,
  // @TODO isServer is only used if useAllRoots is false, so the logical order of the parameter should be changed
  isServer = false,
  useAllRoots = false
) {
  const isProd = config.mode === 'production';

  const parsedConfig = readConfiguration(
    config.source?.tsconfigPath ?? options.tsconfigPath,
    {
      ...DEFAULT_NG_COMPILER_OPTIONS,
      inlineSourceMap: !isProd,
      inlineSources: !isProd,
    }
  );

  const { options: tsCompilerOptions, rootNames } = parsedConfig;

  const compilerOptions = tsCompilerOptions;
  const host = ts.createIncrementalCompilerHost(compilerOptions);

  if (!options.jit) {
    augmentHostWithResources(host, styleTransform, {
      inlineStylesExtension: options.inlineStylesExtension,
      isProd,
    });
  }

  const filteredRootNames = useAllRoots
    ? rootNames
    : rootNames.filter((n) =>
        isServer ? !n.endsWith('main.ts') : n.endsWith('main.ts')
      );

  return {
    rootNames: filteredRootNames,
    compilerOptions,
    host,
  };
}

export function styleTransform(code: string) {
  return sassCompileString(code).css;
}

export async function setupCompilationWithParallelCompilation(
  config: RsbuildConfig,
  options: PluginAngularOptions
) {
  const { rootNames, compilerOptions } = setupCompilation(config, options);
  const parallelCompilation = new ParallelCompilation(options.jit ?? false);
  const fileReplacements: Record<string, string> =
    options.fileReplacements.reduce((r, f) => {
      r[f.replace] = f.with;
      return r;
    }, {});

  try {
    await parallelCompilation.initialize(
      config.source?.tsconfigPath ?? options.tsconfigPath,
      {
        ...compilerOptions,
        fileReplacements,
        modifiedFiles: new Set(rootNames),
        async transformStylesheet(data) {
          const result = sassCompileString(data);
          return result.css;
        },
        processWebWorker(workerFile: string) {
          return transformFileSync(workerFile).code;
        },
      },
      () => compilerOptions
    );
  } catch (e) {
    console.error('Failed to initialize Angular Compilation', e);
  }
  return parallelCompilation;
}
