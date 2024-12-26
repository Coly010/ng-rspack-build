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
import * as compilerCli from '@angular/compiler-cli';
import { CompilerHost, NgtscProgram } from '@angular/compiler-cli';
import { augmentProgramWithVersioning } from './augments';
import { createFileEmitter } from './file-emitter';

export async function buildAndAnalyze(
  rootNames: string[],
  host: ts.CompilerHost,
  compilerOptions: compilerCli.CompilerOptions,
  nextProgram: NgtscProgram | undefined | ts.Program,
  builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram,
  options: {
    watchMode?: boolean;
    jit?: boolean;
  }
) {
  let builder: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  let typeScriptProgram: ts.Program;
  let angularCompiler: NgtscProgram['compiler'];

  if (!options.jit) {
    // Create the Angular specific program that contains the Angular compiler
    const angularProgram: NgtscProgram = new compilerCli.NgtscProgram(
      rootNames,
      compilerOptions,
      host as CompilerHost,
      nextProgram as any
    );
    const angularCompiler = angularProgram.compiler;
    const typeScriptProgram = angularProgram.getTsProgram();
    augmentProgramWithVersioning(typeScriptProgram);

    const builder = (builderProgram =
      ts.createEmitAndSemanticDiagnosticsBuilderProgram(
        typeScriptProgram,
        host,
        builderProgram
      ));

    await angularCompiler.analyzeAsync();

    nextProgram = angularProgram;
  } else {
    builder = builderProgram =
      ts.createEmitAndSemanticDiagnosticsBuilderProgram(
        rootNames,
        compilerOptions,
        host,
        nextProgram as any
      );

    typeScriptProgram = builder.getProgram();
    nextProgram = builderProgram as unknown as ts.Program;
  }

  if (!options.watchMode) {
    // When not in watch mode, the startup cost of the incremental analysis can be avoided by
    // using an abstract builder that only wraps a TypeScript program.
    builder = ts.createAbstractBuilder(typeScriptProgram!, host);
  }

  const getTypeChecker = () => builder.getProgram().getTypeChecker();
  const fileEmitter = createFileEmitter(
    builder!,
    mergeTransformers({}, angularCompiler!.prepareEmit().transformers),
    () => [],
    angularCompiler!
  );

  return fileEmitter;
}

function mergeTransformers(
  first: ts.CustomTransformers,
  second: ts.CustomTransformers
): ts.CustomTransformers {
  const result: ts.CustomTransformers = {};

  if (first.before || second.before) {
    result.before = [...(first.before || []), ...(second.before || [])];
  }

  if (first.after || second.after) {
    result.after = [...(first.after || []), ...(second.after || [])];
  }

  if (first.afterDeclarations || second.afterDeclarations) {
    result.afterDeclarations = [
      ...(first.afterDeclarations || []),
      ...(second.afterDeclarations || []),
    ];
  }

  return result;
}
