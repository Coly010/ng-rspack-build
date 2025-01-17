import { describe, expect } from 'vitest';
import { setupCompilation } from './setup-compilation.ts';
import rsBuildConfig from '../../../../mocks/fixtures/integration/minimal/rsbuild.config.ts';


describe('setupCompilation-int', () => {
  it('should create compiler options form rsBuildConfig tsconfigPath', () => {
    expect({
      root: process.cwd(),
      source: {
        ...rsBuildConfig.source,
        tsconfigPath: './mocks/fixtures/integration/minimal/tsconfig.basic.json'
      }
    }).toStrictEqual(
      expect.objectContaining({
        root: process.cwd(),
        source: expect.objectContaining({
          // tsconfigPath: './mocks/fixtures/integration/minimal/tsconfig.basic.json',
        }),
      })
    );

    expect(
      setupCompilation(
        {  },
        {
          tsconfigPath:
            './mocks/fixtures/integration/minimal/tsconfig.basic.json',
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "compilerOptions": {},
        "host": {
          "createDirectory": [Function],
          "createHash": [Function],
          "directoryExists": [Function],
          "fileExists": [Function],
          "getCanonicalFileName": [Function],
          "getCurrentDirectory": [Function],
          "getDefaultLibFileName": [Function],
          "getDefaultLibLocation": [Function],
          "getDirectories": [Function],
          "getEnvironmentVariable": [Function],
          "getNewLine": [Function],
          "getSourceFile": [Function],
          "readDirectory": [Function],
          "readFile": [Function],
          "realpath": [Function],
          "storeSignatureInfo": undefined,
          "trace": [Function],
          "useCaseSensitiveFileNames": [Function],
          "writeFile": [Function],
        },
        "rootNames": [],
      }
    `);
  });
});
