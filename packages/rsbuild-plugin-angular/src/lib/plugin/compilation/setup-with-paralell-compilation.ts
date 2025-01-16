import type { RsbuildConfig } from '@rsbuild/core';
import type { PluginAngularOptions } from '../../models/plugin-options';
import { ParallelCompilation } from '@angular/build/src/tools/angular/compilation/parallel-compilation';
import { transformFileSync } from '@swc/core';
import { setupCompilation, styleTransform } from './setup-compilation';

export async function setupCompilationWithParallelCompilation(
  config: Pick<RsbuildConfig, 'source'>,
  options: Pick<
    PluginAngularOptions,
    'jit' | 'inlineStylesExtension' | 'fileReplacements' | 'tsconfigPath'
  >
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
        // @TODO replace when [#61](https://github.com/Coly010/ng-rspack-build/issues/61) is merged
        transformStylesheet: (styles) =>
          Promise.resolve(styleTransform(styles)),
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
