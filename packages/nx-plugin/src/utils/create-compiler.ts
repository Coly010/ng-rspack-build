import {
  Compiler,
  MultiCompiler,
  type Configuration,
  rspack,
} from '@rspack/core';

export function createCompiler(
  config: Configuration[]
): Compiler | MultiCompiler {
  return rspack(config);
}

/**
 * Check if the compiler object has the property ´compilers´ defined
 * @param compiler
 */
export function isMultiCompiler(
  compiler: Compiler | MultiCompiler
): compiler is MultiCompiler {
  return 'compilers' in compiler;
}

export function getStatsOptions(compiler: Compiler | MultiCompiler) {
  return isMultiCompiler(compiler)
    ? {
        children: compiler.compilers.map((compiler) =>
          compiler.options ? compiler.options.stats : undefined
        ),
      }
    : compiler.options
    ? compiler.options.stats
    : undefined;
}
