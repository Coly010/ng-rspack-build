import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import ts, { EmitResult, SourceFile } from 'typescript';
import { createFileEmitter } from './file-emitter';
import { type NgtscProgram, OptimizeFor } from '@angular/compiler-cli';

describe('createFileEmitter', () => {
  const mockSourceFile = {
    fileName: 'test/file.ts',
    getText(sourceFile?: ts.SourceFile): string {
      return 'console.log("Hello, World!");';
    }
  } as ts.SourceFile;
  const mockProgram = {
    getSourceFile: vi.fn(),
    emit: vi.fn()
  } as unknown as ts.BuilderProgram & {
    getSourceFile: MockInstance<
      [string],
      ReturnType<ts.BuilderProgram['getSourceFile']>
    >;
    emit: MockInstance<
      [SourceFile | undefined, (...args: any) => void],
      ReturnType<ts.BuilderProgram['emit']>
    >;
  };

  const mockAngularCompiler = {
    getDiagnosticsForFile: vi.fn()
  } as unknown as NgtscProgram['compiler'];

  beforeEach(() => {
    mockProgram.getSourceFile.mockClear();
    mockProgram.emit.mockClear();
  })

  it('should return undefined if the source file is not found', async () => {
    const emitter = createFileEmitter(mockProgram);
    const result = await emitter('nonexistent-file.ts');

    expect(result).toBeUndefined();
    expect(mockProgram.getSourceFile).toHaveBeenCalledWith(
      'nonexistent-file.ts'
    );
  });

  it('should return emitted content if source file is found', async () => {
    mockProgram.getSourceFile.mockReturnValue(mockSourceFile);
    mockProgram.emit.mockImplementation((file, callback) => {
      callback('file.ts', 'file.ts');
      return undefined as unknown as EmitResult
    });


    const emitter = createFileEmitter(mockProgram);
    const result = await emitter(mockSourceFile.fileName);
    expect(result?.content).toBe('file.ts')
  });

  it('should handle diagnostics from the Angular compiler', async () => {
    const mockDiagnostics = [
      { category: ts.DiagnosticCategory.Error, messageText: 'Error message' },
      {
        category: ts.DiagnosticCategory.Warning,
        messageText: 'Warning message'
      }
    ];

    mockProgram.getSourceFile.mockReturnValue(mockSourceFile);
    mockAngularCompiler.getDiagnosticsForFile.mockReturnValue(mockDiagnostics);

    const emitter = createFileEmitter(
      mockProgram,
      {},
      undefined,
      mockAngularCompiler
    );
    const result = await emitter('file.ts');

    expect(result).toStrictEqual(expect.objectContaining({
      errors: ['Error message'],
      warnings: ['Warning message']
    }));
    expect(mockAngularCompiler.getDiagnosticsForFile).toHaveBeenCalledWith(
      mockSourceFile,
      OptimizeFor.WholeProgram
    );
  });

  it('should call onAfterEmit callback after emitting', async () => {
    const onAfterEmit = vi.fn();
    mockProgram.getSourceFile.mockReturnValue(mockSourceFile);
    mockProgram.emit.mockImplementation((file, callback) => {
      callback(mockSourceFile.fileName, mockSourceFile.getText());
      return undefined as unknown as EmitResult
    });

    const emitter = createFileEmitter(mockProgram, {}, onAfterEmit);
    await emitter(mockSourceFile.fileName);

    expect(onAfterEmit).toHaveBeenCalledWith(mockSourceFile);
  });

  it('should ignore non-JavaScript files during emit', async () => {
    mockProgram.getSourceFile.mockReturnValue(mockSourceFile);
    mockProgram.emit.mockImplementation((file, callback) => {
      callback(mockSourceFile.fileName, mockSourceFile.getText());
      return undefined as unknown as EmitResult
    });

    const emitter = createFileEmitter(mockProgram);
    const result = await emitter(mockSourceFile.fileName);

    expect(result).toEqual({
      content: undefined,
      dependencies: [],
      errors: [],
      warnings: []
    });
  });
});
