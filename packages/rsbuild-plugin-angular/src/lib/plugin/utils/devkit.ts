/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Brandon Roberts
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import packageJson from '../../../../package.json';
import { VERSION } from '@angular/compiler-cli';
import type { CompilerPluginOptions } from '../models/compiler-plugin-options';
import * as sfc from './source-file-cache.js';

const angularMajor = Number(VERSION.major);
const angularMinor = Number(VERSION.minor);
const angularPatch = Number(VERSION.patch);
let sourceFileCache: any;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
let cjt: Function;
let jt: any;

if (angularMajor < 15) {
  throw new Error(
    `${packageJson.name} is not compatible with Angular v14 and lower`
  );
}
// the imports moved between versions. the follwoing code is a workaround to make it work with all versions
else if (angularMajor >= 15 && angularMajor < 16) {
  const cp = require('@angular-devkit/build-angular/src/builders/browser-esbuild/compiler-plugin.js');
  const {
    createJitResourceTransformer,
  } = require('@angular-devkit/build-angular/src/builders/browser-esbuild/angular/jit-resource-transformer.js');
  const {
    JavaScriptTransformer,
  } = require('@angular-devkit/build-angular/src/builders/browser-esbuild/javascript-transformer.js');

  sourceFileCache = cp.SourceFileCache;
  cjt = createJitResourceTransformer;
  jt = JavaScriptTransformer;
} else if (angularMajor >= 16 && angularMajor < 18) {
  const cp = require('@angular-devkit/build-angular/src/tools/esbuild/angular/compiler-plugin.js');
  const {
    createJitResourceTransformer,
  } = require('@angular-devkit/build-angular/src/tools/esbuild/angular/jit-resource-transformer.js');
  const {
    JavaScriptTransformer,
  } = require('@angular-devkit/build-angular/src/tools/esbuild/javascript-transformer.js');

  /**
   * Workaround for compatibility with Angular 17.0+
   */
  if (typeof cp['SourceFileCache'] !== 'undefined') {
    sourceFileCache = cp.SourceFileCache;
  } else {
    sourceFileCache = sfc.SourceFileCache;
  }

  cjt = createJitResourceTransformer;
  jt = JavaScriptTransformer;
} else {
  const {
    createJitResourceTransformer,
    JavaScriptTransformer,
    SourceFileCache,
  } = require('@angular/build/private');

  sourceFileCache = SourceFileCache;
  cjt = createJitResourceTransformer;
  jt = JavaScriptTransformer;
}

export {
  cjt as createJitResourceTransformer,
  jt as JavaScriptTransformer,
  sourceFileCache as SourceFileCache,
  CompilerPluginOptions,
  angularMajor,
  angularMinor,
  angularPatch,
};
