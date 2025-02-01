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
  useTsProjectReferences?: boolean;
}

export const DEFAULT_NG_COMPILER_OPTIONS: ts.CompilerOptions = {
  suppressOutputPathCheck: true,
  outDir: undefined,
  sourceMap: true,
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
  options: SetupCompilationOptions
) {
  const isProd = config.mode === 'production';

  const { readConfiguration } = await loadCompilerCli();
  const { options: tsCompilerOptions, rootNames } = readConfiguration(
    config.source?.tsconfigPath ?? options.tsconfigPath,
    {
      ...DEFAULT_NG_COMPILER_OPTIONS,
      ...(options.useTsProjectReferences
        ? {
            sourceMap: false,
            inlineSources: false,
            isolatedModules: true,
          }
        : {}),
    }
  );

  const compilerOptions = tsCompilerOptions;
  const host = ts.createIncrementalCompilerHost(compilerOptions);

  if (!options.jit) {
    augmentHostWithResources(host, styleTransform, {
      inlineStylesExtension: options.inlineStylesExtension,
      isProd,
    });
  }

  return {
    rootNames,
    compilerOptions,
    host,
  };
}

export function styleTransform(styles: string) {
  try {
    // While compileStringAsync should be faster, it can cause issues when being spawned for large projects
    return compileString(styles).css;
  } catch (e) {
    console.error(
      'Failed to compile styles. Continuing execution ignoring failing stylesheet...',
      e
    );
    return '';
  }
}
