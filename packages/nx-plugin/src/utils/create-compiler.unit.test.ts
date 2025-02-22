import { describe, it, expect } from 'vitest';
import { isMultiCompiler } from './create-compiler';
import { MultiCompiler } from '@rspack/core';

describe('isMultiCompiler', () => {
  it('should return true if the compiler is a MultiCompiler', () => {
    expect(isMultiCompiler({ compilers: [] } as unknown as MultiCompiler)).toBe(
      true
    );
  });

  it('should return false if the compiler is a Compiler', () => {
    expect(isMultiCompiler({} as unknown as MultiCompiler)).toBe(false);
  });
});
