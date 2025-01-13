import { describe, expect } from 'vitest';

vi.mock('@angular/compiler-cli', async () => {
  const actual = await vi.importActual('@angular/compiler-cli');
  return {
    ...actual,
    VERSION: {
      major: 19,
      minor: 4,
      patch: 2,
    },
  };
});

describe('devkit importing an angular version >=19', async () => {
  it('should return the exports', async () => {
    expect(import('./devkit.ts')).resolves.toStrictEqual(
      expect.objectContaining({
        JavaScriptTransformer: expect.any(Function),
        SourceFileCache: expect.any(Function),
        angularMajor: 19,
        angularMinor: 4,
        angularPatch: 2,
        createJitResourceTransformer: expect.any(Function),
      })
    );
  });
});
