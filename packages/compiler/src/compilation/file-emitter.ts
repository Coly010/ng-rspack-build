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

import * as ts from 'typescript';
import { OptimizeFor } from '@angular/compiler-cli';
import { FileEmitter } from '../models';
import { isStandardJsFile } from '../utils/regex-filters';
import { type NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { loadCompilerCli } from '../utils';

export function createFileEmitter(
  program: ts.BuilderProgram,
  transformers: ts.CustomTransformers = {},
  onAfterEmit?: (sourceFile: ts.SourceFile) => void,
  angularCompiler?: NgCompiler
): FileEmitter {
  return async (file: string) => {
    const { OptimizeFor } = await loadCompilerCli();
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) {
      return undefined;
    }

    const diagnostics = angularCompiler
      ? angularCompiler.getDiagnosticsForFile(
          sourceFile,
          OptimizeFor.WholeProgram
        )
      : [];

    const errors = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory?.Error)
      .map((d) => d.messageText);

    const warnings = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory?.Warning)
      .map((d) => d.messageText);

    let content: string | undefined;
    program.emit(
      // When targetSource file is specified, it emits the files corresponding to that source file
      sourceFile,
      (filename, data) => {
        if (isStandardJsFile(filename)) {
          content = data;
        }
      },
      undefined /* cancellationToken */,
      undefined /* emitOnlyDtsFiles */,
      transformers
    );

    onAfterEmit?.(sourceFile);

    return { content, dependencies: [], errors, warnings };
  };
}
