import type { Compilation } from '@rspack/core';
import type { JavaScriptTransformer } from '@angular/build/src/tools/esbuild/javascript-transformer';

export const NG_RSPACK_SYMBOL_NAME = 'NG_RSPACK_BUILD';

export type NG_RSPACK_COMPILATION_STATE = {
  javascriptTransformer: JavaScriptTransformer;
  typescriptFileCache: Map<string, string>;
};
export type NgRspackCompilation = Compilation & {
  [NG_RSPACK_SYMBOL_NAME]: NG_RSPACK_COMPILATION_STATE;
};
