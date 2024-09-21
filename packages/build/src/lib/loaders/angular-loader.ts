import type { LoaderContext } from '@rspack/core';
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
  }

  const { typescriptFileCache, javascriptTransformer } = (
    this._compilation as NgRspackBuildEnhancedCompilation
  )[NG_RSPACK_SYMBOL_NAME];

  const request = this.resource;
  const contents = typescriptFileCache.get(request);
  if (contents === undefined) {
    callback(null, content);
  } else if (typeof contents === 'string') {
    javascriptTransformer
      .transformData(request, contents, true /* skipLinker */, false)
      .then((contents) => {
        // Store as the returned Uint8Array to allow caching the fully transformed code
        typescriptFileCache.set(request, contents);
        callback(null, Buffer.from(contents));
      });
  } else {
    callback(null, Buffer.from(contents));
  }
}
