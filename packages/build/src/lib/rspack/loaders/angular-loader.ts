import type { LoaderContext } from '@rspack/core';
import { normalize } from 'path';
import {
  NG_RSPACK_SYMBOL_NAME,
  NgRspackBuildEnhancedCompilation,
} from '../types';

export default function loader(this: LoaderContext<unknown>, content: string) {
  const callback = this.async();
  if (
    !(this._compilation as NgRspackBuildEnhancedCompilation)[
      NG_RSPACK_SYMBOL_NAME
    ]
  ) {
    callback(null, content);
  } else {
    const { typescriptFileCache, javascriptTransformer } = (
      this._compilation as NgRspackBuildEnhancedCompilation
    )[NG_RSPACK_SYMBOL_NAME];

    const request = this.resourcePath;
    const normalizedRequest = normalize(request);
    const contents = typescriptFileCache.get(normalizedRequest);
    if (contents === undefined) {
      callback(null, content);
    } else if (typeof contents === 'string') {
      javascriptTransformer
        .transformData(
          normalizedRequest,
          contents,
          true /* skipLinker */,
          false
        )
        .then((contents) => {
          // Store as the returned Uint8Array to allow caching the fully transformed code
          typescriptFileCache.set(normalizedRequest, contents);
          callback(null, Buffer.from(contents));
        });
    } else {
      callback(null, Buffer.from(contents));
    }
  }
}
