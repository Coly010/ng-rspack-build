import { RsbuildConfig } from '@rsbuild/core';
import * as compilerCli from '@angular/compiler-cli';
import * as ts from 'typescript';
import { compileString } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { PluginAngularOptions } from '../../models/plugin-options';

export const DEFAULT_NG_COMPILER_OPTIONS: ts.CompilerOptions = {
  suppressOutputPathCheck: true,
  outDir: undefined,
  sourceMap: false,
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

  const { options: tsCompilerOptions, rootNames } =
    compilerCli.readConfiguration(
      config.source?.tsconfigPath ?? options.tsconfigPath,
      DEFAULT_NG_COMPILER_OPTIONS
    );

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
  return compileString(code).css;
}
