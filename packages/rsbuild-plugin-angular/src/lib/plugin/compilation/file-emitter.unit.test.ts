import { describe, expect, it, vi } from 'vitest';
import { createFileEmitter } from './file-emitter';
import { sourceFileFromCode } from '@ng-rspack/testing-utils';
import { NgtscProgram } from '@angular/compiler-cli';

describe.todo('createFileEmitter', () => {
  const mockSourceFile = sourceFileFromCode({
    path: 'file.ts',
    code: 'console.log("Hello, World!");',
  });
  const mockProgram = {
    getSourceFile: vi.fn(),
    emit: vi.fn(),
  } as unknown as NgtscProgram;

  it('should return undefined if the source file is not found', async () => {
    mockProgram.getSourceFile.mockReturnValue(undefined);
    const emitter = createFileEmitter(mockProgram);
    const result = await emitter('nonexistent-file.ts');

    expect(result).toBeUndefined();
    expect(mockProgram.getSourceFile).toHaveBeenCalledWith(
      'nonexistent-file.ts'
    );
  });

  it('should call onAfterEmit callback after emitting', async () => {
    const onAfterEmit = vi.fn();
    mockProgram.getSourceFile.mockReturnValue(mockSourceFile);
    const emitter = createFileEmitter(mockProgram, {}, onAfterEmit);
    await emitter('file.ts');

    expect(onAfterEmit).toHaveBeenCalledWith(mockSourceFile);
  });
});
