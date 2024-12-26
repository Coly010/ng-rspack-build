import { LoaderContext } from '@rspack/core';
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
    const { javascriptTransformer } = (
      this._compilation as NgRspackBuildEnhancedCompilation
    )[NG_RSPACK_SYMBOL_NAME];

    const request = this.resourcePath;
    if (
      request.startsWith('data:text/javascript') &&
      request.includes('__module_federation_bundler_runtime__')
    ) {
      callback(null, content);
      return;
    }
    javascriptTransformer
      .transformFile(request, false, false)
      .then((contents) => {
        callback(null, Buffer.from(contents));
      });
  }
}
