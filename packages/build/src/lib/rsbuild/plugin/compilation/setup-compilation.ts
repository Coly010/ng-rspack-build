import { RsbuildConfig } from '@rsbuild/core';
import * as compilerCli from '@angular/compiler-cli';
import * as ts from 'typescript';
import { compileString as sassCompileString } from 'sass-embedded';
import { augmentHostWithResources } from './augments';
import { PluginAngularOptions } from '../models';

export function setupCompilation(
  config: RsbuildConfig,
  options: PluginAngularOptions
) {
  const isProd = config.mode === 'production';

  const { options: tsCompilerOptions, rootNames: rn } =
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

  return {
    rootNames: rn,
    compilerOptions,
    host,
  };
}
