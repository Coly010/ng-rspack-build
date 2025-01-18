import { RsbuildConfig } from '@rsbuild/core';
import * as compilerCli from '@angular/compiler-cli';
import * as ts from 'typescript';
import { compileStringAsync } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { InlineStyleExtension, FileReplacement } from '../models';

export interface SetupCompilationOptions {
  tsconfigPath: string;
  jit: boolean;
  inlineStylesExtension: InlineStyleExtension;
  fileReplacements: Array<FileReplacement>;
}

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
  options: SetupCompilationOptions,
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

export async function styleTransform(styles: string) {
  try {
    return (await compileStringAsync(styles)).css;
  } catch (e) {
    console.error(
      'Failed to compile styles. Continuing execution ignoring failing stylesheet...',
      e
    );
    return '';
  }
}
