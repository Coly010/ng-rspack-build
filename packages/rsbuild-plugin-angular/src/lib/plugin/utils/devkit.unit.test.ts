import { afterAll, beforeEach, describe, expect } from 'vitest';
import packageJson from '../../../../package.json';

describe('devkit import', async () => {
  const VERSION = {
    major: 42,
    minor: 4,
    patch: 2,
  };

  // @NOTICE vitest does not support mocking of imports over "require" calls. (It does support "import" calls)
  // So, we have to test the error message instead of the actual exports. :(
  // https://vitest.dev/api/vi.html#vi-mock
  const ng15_16Import =
    '@angular-devkit/build-angular/src/builders/browser-esbuild/compiler-plugin.js';
  const ng16_17Import =
    '@angular-devkit/build-angular/src/tools/esbuild/angular/compiler-plugin.js';

  beforeEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    vi.doUnmock('@angular/compiler-cli');
  });

  it('should throw an error when its import is resolved from an angular version <15', async () => {
    vi.doMock('@angular/compiler-cli', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('@angular/compiler-cli')>()),
        VERSION: {
          ...VERSION,
          major: 14,
        },
      };
    });

    await expect(() => import('./devkit.ts')).rejects.toThrowError(
      `${packageJson.name} is not compatible with Angular v14 and lower`
    );
  });

  it('should return the exports when importing an angular version >=15 & <16', async () => {
    vi.doMock('@angular/compiler-cli', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('@angular/compiler-cli')>()),
        VERSION: {
          ...VERSION,
          major: 15,
        },
      };
    });

    expect(import('./devkit.ts')).rejects.toThrow(ng15_16Import);
  });

  it('should return the exports when importing an angular version >=16 & <18', async () => {
    vi.doMock('@angular/compiler-cli', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('@angular/compiler-cli')>()),
        VERSION: {
          ...VERSION,
          major: 16,
        },
      };
    });

    expect(import('./devkit.ts')).rejects.toThrow(ng16_17Import);
  });

  it('should return the exports when importing an angular version >=19', async () => {
    vi.doMock('@angular/compiler-cli', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('@angular/compiler-cli')>()),
        VERSION: {
          ...VERSION,
          major: 19,
        },
      };
    });

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
