import { afterAll, beforeEach, describe, expect, vi } from 'vitest';
import packageJson from '../../package.json';

// TODO @Coly010: Figure out a way to mock require calls
describe.skip('devkit import', async () => {
  // @NOTICE vitest does not support mocking of imports over "require" calls. (It does support "import" calls)
  // So, we have to test the error message instead of the actual exports. :(
  // https://vitest.dev/api/vi.html#vi-mock
  const ng15_16Import =
    '@angular-devkit/build-angular/src/builders/browser-esbuild/compiler-plugin.js';
  const ng16_17Import =
    '@angular-devkit/build-angular/src/tools/esbuild/angular/compiler-plugin.js';

  const versionMock = vi.fn();
  vi.doMock(require.resolve('@angular/compiler-cli/package.json'), versionMock);

  beforeEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    vi.doUnmock(require.resolve('@angular/compiler-cli/package.json'));
  });

  it('should throw an error when its import is resolved from an angular version <15', async () => {
    versionMock.mockReturnValue({
      version: '14.0.0',
    });

    await expect(() => import('./devkit.ts')).rejects.toThrowError(
      `${packageJson.name} is not compatible with Angular v14 and lower`
    );
  });

  it('should return the exports when importing an angular version >=15 & <16', async () => {
    vi.doMock(require.resolve('@angular/compiler-cli/package.json'), () => {
      return {
        version: '15.0.0',
      };
    });

    expect(import('./devkit.ts')).rejects.toThrow(ng15_16Import);
  });

  it('should return the exports when importing an angular version >=16 & <18', async () => {
    vi.doMock(require.resolve('@angular/compiler-cli/package.json'), () => {
      return {
        version: '16.0.0',
      };
    });

    expect(import('./devkit.ts')).rejects.toThrow(ng16_17Import);
  });

  it('should return the exports when importing an angular version >=19', async () => {
    vi.doMock(require.resolve('@angular/compiler-cli/package.json'), () => {
      return {
        version: '19.0.0',
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
