/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { join } from 'path';
import { LoaderContext } from '@rspack/core';

export const HmrLoader = __filename;
const hmrAcceptPath = join(__dirname, './hmr-accept.js').replace(/\\/g, '/');

export default function localizeExtractLoader(
  this: LoaderContext,
  content: string,
  map: string
) {
  const source = `${content}

  // HMR Accept Code
  import ngHmrAccept from '${hmrAcceptPath}';
  ngHmrAccept(module);
  `;

  this.callback(null, source, map);

  return;
}
