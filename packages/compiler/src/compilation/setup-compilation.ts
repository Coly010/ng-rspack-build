import { RsbuildConfig } from '@rsbuild/core';
import * as ts from 'typescript';
import { compileString } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { InlineStyleExtension, FileReplacement } from '../models';
import { loadCompilerCli } from '../utils';

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

export async function setupCompilation(
  config: Pick<RsbuildConfig, 'mode' | 'source'>,
  options: SetupCompilationOptions,
  // @TODO isServer is only used if useAllRoots is false, so the logical order of the parameter should be changed
  isServer = false,
  useAllRoots = false
) {
  const isProd = config.mode === 'production';

  const { readConfiguration } = await loadCompilerCli();
  const { options: tsCompilerOptions, rootNames } = readConfiguration(
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
    // While compileStringAsync should be faster, it can cause issues when being spawned for large projects
    return (await compileString(styles)).css;
  } catch (e) {
    console.error(
      'Failed to compile styles. Continuing execution ignoring failing stylesheet...',
      e
    );
    return '';
  }
}
