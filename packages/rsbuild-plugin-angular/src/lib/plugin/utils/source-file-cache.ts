/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*

 @ng-rspack/testing-utils:lint                                6s          Cache Miss     │
│           > Task logs: https://cloud.nx.app/logs/lnLyIDkm0x                                      │
│   ✖      rsbuild-plugin-angular:unit-test                            18s          Cache Miss     │
│           > Task logs: https://cloud.nx.app/logs/rvNqMuniog                                      │
│   ✖      rsbuild-plugin-angular:build                                19s          Cache Miss     │
│           > Task logs: https://cloud.nx.app/logs/8vyxcksv5A

* */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import type ts from 'typescript';
import { isUsingWindows } from './utils';

const WINDOWS_SEP_REGEXP = new RegExp(`\\${path.win32.sep}`, 'g');

export class SourceFileCache extends Map<string, ts.SourceFile> {
  readonly modifiedFiles = new Set<string>();
  readonly babelFileCache = new Map<string, Uint8Array>();
  readonly typeScriptFileCache = new Map<string, string | Uint8Array>();

  referencedFiles?: readonly string[];

  constructor(readonly persistentCachePath?: string) {
    super();
  }

  invalidate(files: Iterable<string>): void {
    if (files !== this.modifiedFiles) {
      this.modifiedFiles.clear();
    }
    for (let file of files) {
      this.babelFileCache.delete(file);
      this.typeScriptFileCache.delete(pathToFileURL(file).href);

      // Normalize separators to allow matching TypeScript Host paths
      if (isUsingWindows()) {
        file = file.replace(WINDOWS_SEP_REGEXP, path.posix.sep);
      }

      this.delete(file);
      this.modifiedFiles.add(file);
    }
  }
}
