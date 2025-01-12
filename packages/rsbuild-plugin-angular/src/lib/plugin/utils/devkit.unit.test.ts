import { describe, expect } from 'vitest';

describe('devkit importing an angular version >15', async () => {
  vi.mock('@angular/compiler-cli', async () => {
    const actual = await vi.importActual('@angular/compiler-cli');
    return {
      ...actual,
      VERSION: {
        major: 42,
        minor: 4,
        patch: 2,
      },
    };
  });

  it('should return the exports', async () => {
    expect(import('./devkit.ts')).resolves.toStrictEqual(
      expect.objectContaining({
        JavaScriptTransformer: expect.any(Function),
        SourceFileCache: expect.any(Function),
        angularMajor: 42,
        angularMinor: 4,
        angularPatch: 2,
        createJitResourceTransformer: expect.any(Function),
      })
    );
  });
});
