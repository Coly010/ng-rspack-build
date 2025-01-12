import { describe, expect } from 'vitest';

vi.mock('@angular/compiler-cli', async () => {
  const actual = await vi.importActual('@angular/compiler-cli');
  return {
    ...actual,
    VERSION: {
      major: 14,
    },
  };
});

describe('devkit importing an angular version <15', async () => {
  it('should throw an error when its import is resolved', async () => {
    await expect(() => import('./devkit.ts')).rejects.toThrowError(
      'AnalogJS is not compatible with Angular v14 and lower'
    );
  });
});
