import {
  createAbstractBuilder,
  createCompilerHost,
  type Program,
  SourceFile,
} from 'typescript';
import { createFileEmitter } from './file-emitter';
import { join } from 'path';
import {
  type CompilerHost,
  NgtscProgram,
  readConfiguration,
} from '@angular/compiler-cli';
import path from 'node:path';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import { it } from 'vitest';

describe('createFileEmitter - Integration Test', () => {
  // maintains a minimal Angular project
  const minimalAppDir = join(process.cwd(), 'mocks', 'fixtures', 'minimal');
  // maintains a minimal Angular tsconfig that holds all options one file, no use of extends
  const tsconfigPath = join(minimalAppDir, 'tsconfig.json');

  console.log(`Loading tsconfig from ${tsconfigPath}`);
  const isProd = false;
  const { options: tsCompilerOptions, rootNames } = readConfiguration(
    tsconfigPath,
    {
      suppressOutputPathCheck: true,
      outDir: undefined,
      sourceMap: false,
      inlineSourceMap: !isProd,
      inlineSources: !isProd,
      declaration: false,
      declarationMap: false,
      allowEmptyCodegenFiles: false,
      annotationsAs: 'decorators',
      enableResourceInlining: false,
      noEmitOnError: false,
      mapRoot: undefined,
      sourceRoot: undefined,
      supportTestBed: false,
      supportJitMode: false,
    }
  );

  console.log(
    `Creating compiler host with from ${JSON.stringify(
      tsCompilerOptions,
      null,
      2
    )}`
  );
  const host: CompilerHost = createCompilerHost(tsCompilerOptions);

  console.log(
    `Creating ng program with rootNames:\n - ${rootNames.join(
      '\n - '
    )}, compiler host and TS compiler options`
  );
  const angularProgram: NgtscProgram = new NgtscProgram(
    rootNames,
    tsCompilerOptions,
    host
  );

  const angularCompiler: NgCompiler = angularProgram.compiler;
  const typeScriptProgram: Program = angularProgram.getTsProgram();

  const sourceFiles = typeScriptProgram
    .getSourceFiles()
    .map((f: SourceFile) => path.relative(process.cwd(), f.fileName))
    .filter((f: string) => !f.includes('node_modules'));

  console.log(
    `The TypeScript program from the Angular program contains the following sourceFiles:\n - ${sourceFiles.join(
      '\n - '
    )}`
  );

  console.log(`Setting up builder program with TS program and host`);
  const builder = createAbstractBuilder(typeScriptProgram, host);

  /**
   * The used method to retrieve Diagnostics `getDiagnosticsForFile` is not given.
   *
   * Alternative approach:
   * const sourceFile = builder.getSourceFile(diagnosticMessagesTsFile);
   *     const diagnostics = [
   *       ...angularProgram.getTsSyntacticDiagnostics(),
   *       ...angularProgram.getTsSemanticDiagnostics(),
   *       ...angularProgram.getNgSemanticDiagnostics(diagnosticMessagesTsFile),
   *       ...angularProgram.getNgOptionDiagnostics(),
   *       ...angularProgram.getNgStructuralDiagnostics(diagnosticMessagesTsFile),
   *     ];
   *     console.log(
   *       `Diagnostics of file ${diagnosticMessagesTsFile}: ${diagnostics?.length}`
   *     );
   */

  it.each([
    rootNames.at(0), // main.ts
    join(minimalAppDir, 'app.component.ts'),
    join(minimalAppDir, 'diagnostic-emissions.component.ts'),
  ])('should emit diagnostics', async (filename) => {
    const emitter = createFileEmitter(
      builder,
      undefined,
      () => [],
      angularCompiler
    );

    console.log(`Emitting the file: ${filename}`);
    const result = await emitter(filename);

    expect(result).toStrictEqual({
      content: undefined,
      dependencies: [],
      errors: [],
      warnings: [],
    });
  });

  it.todo('should return emitted content if source file is found', () => {});

  it.todo('should ignore non-JavaScript files during emit', () => {});

  it.todo('should handle diagnostics from the Angular compiler', () => {});
});
